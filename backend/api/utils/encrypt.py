import sys
import numpy as np
import cv2 as cv
import uuid
np.set_printoptions(threshold=sys.maxsize)
from .decrypt import decrypt, string_to_binary_key


def rotate_col(block, col, shifts=1, clock=1):
    block[:, col] = np.roll(block[:, col], clock*shifts)
    return block

def rotate_row(block, row, shifts=1, clock=1):
    block[row, :] = np.roll(block[row, :], clock*shifts)
    return block
    
def rotate_front(block, shifts=1, clock=-1):
    return np.rot90(block, k=clock*shifts)
    

def scramble_helper(block, num, op):
    n, m, _ = block.shape
    match op:
        case "L":
            return rotate_col(block, num)
        case "R":
            return rotate_col(block, m - num - 1)
        case "U":
            return rotate_row(block, num)
        case "D":
            return rotate_row(block, n - num - 1)
        case "L'":
            return rotate_col(block, num, clock=-1)
        case "R'":
            return rotate_col(block, m - num - 1, clock=-1)
        case "U'":
            return rotate_row(block, num, clock=-1)
        case "D'":
            return rotate_row(block, n - num - 1, clock=-1)
        case "L2":
            return rotate_col(block, num, shifts=2)
        case "R2":
            return rotate_col(block, m - num - 1, shifts=2)
        case "U2":
            return rotate_row(block, num, 2)
        case "D2":
            return rotate_row(block, n - num - 1, 2)
        case "F2":
            return rotate_front(block, shifts=2)
        case "F":
            return rotate_front(block)
        case "F'":
            return rotate_front(block, 1, clock=1)
        case _:
            return block
        
        
def scrambling_seq(k1, k2):
    seq = []
    n = len(k1)
    div = 4
    for i in range(0, n, div):
        num = int(k1[i:i+div], base=2)
        row, col = int(k2[i:i+2], 2), int(k2[i+2:i+div], base=2)
        seq.append([num, row, col])
    return seq

def scramble_img(enc_matrix, seq, block, block_size):
    n, m, _ = block.shape
    if n % block_size != 0 or m  % block_size != 0:
        return block
    for op in seq:
        block = scramble_helper(block, op[0], enc_matrix[op[1]][op[2]])

    return block
    
def update_keys(k1, k2, flip_bit):
    # print(flip_bit)
    n = len(k1)
    uk1, uk2 = k1[1:]+k1[0], k2[1:]+k2[0]
    uk1 = ''.join(str(int(uk1[i]) ^ int(k2[i])) for i in range(n))
    uk2 = ''.join(str(int(uk2[i]) ^ int(k1[i])) for i in range(n))
    uk1_list = list(uk1)
    uk2_list = list(uk2)
    uk1_list[flip_bit] = '1' if uk1_list[flip_bit] == '0' else '0'
    uk2_list[flip_bit] = '1' if uk2_list[flip_bit] == '0' else '0'
    uk1 = ''.join(uk1_list)
    uk2 = ''.join(uk2_list)
    
    return uk1, uk2

def key_reduction(k1, k2):
    n = len(k1)
    new_k1, new_k2 = "", ""
    for i in range(n):
        if i % 4 == 3: continue
        new_k1 += k1[i]
        new_k2 += k2[i]
    return new_k1, new_k2


def frame_rotation_seq(k1, k2, frame_count):
    keylen = len(k1)
    rot_nums, offsets = [], []
    for i in range(frame_count):
        idx = (i * 4) % keylen  
        rot_num = int(k1[idx] + k2[(idx + 3) % keylen], 2)  
        offset = int(k1[(idx+1) % keylen: (idx+4) % keylen] + k2[idx: (idx+3) % keylen], 2)  
        rot_nums.append(rot_num)
        offsets.append(offset)
    return rot_nums, offsets

def frame_rotation(img, k1, k2):
    n, m, _ = img.shape
    keylen = len(k1)
    
    row, col = 0, 0
    while row < n // 2 and col < m // 2:
        # Extract frame edges
        top = img[row, col:m-col]                # Top edge
        right = img[row+1:n-row, m-col-1]        # Right edge
        bottom = img[n-row-1, col:m-col-1][::-1]   # Bottom edge 
        left = img[row+1:n-row-1, col][::-1]       # Left edge 
        tlen, rlen, blen, llen = top.shape[0], right.shape[0], bottom.shape[0], left.shape[0]
        bp = np.concatenate((top, right, bottom, left))
        k1, k2 = update_keys(k1, k2, (row % keylen))
        rot_nums, offsets = frame_rotation_seq(k1, k2, 3)  # 3 = R, G, B
        b, g, r = bp[:, 0], bp[:, 1], bp[:, 2]
        for bitplane, idx in zip((b, g, r), [0, 1, 2]):
            bitplane = np.roll(bitplane, rot_nums[idx] * n * m + offsets[idx])
            bp[:, idx] = bitplane
        
        img[row, col:m-col] = bp[0:tlen]
        img[row+1:n-row, m-col-1] = bp[tlen:tlen + rlen]
        img[n-row-1, col:m-col-1][::-1] = bp[tlen + rlen:tlen + rlen + blen]
        img[row+1:n-row-1, col][::-1] = bp[tlen + rlen + blen:tlen + rlen + blen + llen]
        row += 1
        col += 1
    
    return img

def shuffle(img):
    lookup = np.array([int(f"{i:08b}"[::-1], 2) for i in range(256)], dtype=np.uint8)
    
    # Apply lookup table to all pixels (vectorized operation)
    return lookup[img]

def bitplane_shuffling(img, k1, k2):
    k1, k2 = key_reduction(k1, k2)
    img = frame_rotation(img, k1, k2)
    img = shuffle(img)
    return img

blocks = [16, 32, 64]
enc_matrix = [['L', 'R', 'U', 'D'],
              ['F', "L'", "R'", "U'"],
              ["D'", "F'", 'L2', 'R2'],
              ['U2', 'D2', 'F2', "L"]]

from django.core.files.base import ContentFile

def process_image(img, key):
    rows, cols, _ = img.shape
    random_id = uuid.uuid4().hex

    # Your existing encryption keys
    # k1 = "01010100011010000110000101110100011100110010000001101101011110010010000001001011011101010110111001100111001000000100011001110101"
    # k2 = "11100010001100101111110011110001100100010001001010010001100010001011000101011001111001001110011011010110011110011010001010010011"
    k1 = string_to_binary_key(key)
    k2 = string_to_binary_key(random_id)
    for block_size in blocks:
        newk1, newk2 = k1, k2
        for i in range(0, rows, block_size):
            newk1, newk2 = update_keys(newk1, newk2, i // block_size)
            seq = scrambling_seq(newk1, newk2)
            for j in range(0, cols, block_size):
                img[i:i+block_size, j:j+block_size] = scramble_img(enc_matrix, seq, img[i:i+block_size, j:j+block_size], block_size)

    # Bit-plane shuffle
    img = bitplane_shuffling(img, k1, k2)

    # Save encrypted image to memory
    _, encrypted_buffer = cv.imencode('.png', img)
    encrypted_file = ContentFile(encrypted_buffer.tobytes(), name=f"encrypted_{random_id}.png")


    return encrypted_file, random_id

if __name__ == "__main__":
    import matplotlib.pyplot as plt

    img_name = input("Image Path: ")
    img = cv.imread(img_name)
    original_img = np.copy(img)
    rows, cols, _ = img.shape
    k1="01010100011010000110000101110100011100110010000001101101011110010010000001001011011101010110111001100111001000000100011001110101"
    k2="11100010001100101111110011110001100100010001001010010001100010001011000101011001111001001110011011010110011110011010001010010011"
    for block_size in blocks:
        newk1, newk2 = k1, k2
        for i in range(0, rows, block_size):
            newk1, newk2 = update_keys(newk1, newk2, i // block_size)
            seq = scrambling_seq(newk1, newk2)
            for j in range(0, cols, block_size):
                img[i:i+block_size, j:j+block_size] = scramble_img(enc_matrix, seq, img[i:i+block_size, j:j+block_size], block_size)
        
    img = bitplane_shuffling(img, k1, k2)
    encrypted_img = cv.imwrite(f"encrypted_{img_name.split('.')[0]}.png", img)
    print(encrypted_img)


    if encrypted_img:
        print("Encrypted")
    else:
        print("Failed to Encrypt")
        exit(0)
        
    encrypted_img = cv.imread(f"encrypted_{img_name.split('.')[0]}.png")
    decrypted_img = decrypt(encrypted_img)
    print((decrypted_img==original_img).all())
    decrypted_imgw = cv.imwrite(f"decrypted_{img_name.split('.')[0]}.png", decrypted_img)
    if decrypted_imgw:
        print("Decrypted")
    else: 
        print("Failed to Decrypt")
        exit(0)

    # plt.figure(figsize=(10, 10))
    diff_img = cv.imwrite(f"{img_name.split('.')[0]}_diff_img.png", cv.absdiff(original_img, decrypted_img))


    plt.figure(figsize=(20, 10))

    for idx, imgname in enumerate(((f"{img_name}", 'Original'), \
        (f"encrypted_{img_name.split('.')[0]}.png", 'Encrypted'), \
            (f"decrypted_{img_name.split('.')[0]}.png", 'Decrypted'), \
                (f"{img_name.split('.')[0]}_diff_img.png", 'Difference (Original - Decrypted)'))):
        imgread = cv.imread(imgname[0])
        plt.subplot(2, 2, idx + 1)
        plt.imshow(cv.cvtColor(imgread, cv.COLOR_BGR2RGB))
        plt.title(imgname[1])
        plt.axis("off")



    plt.figure(figsize=(12, 9))

    for i, col in enumerate(('b', 'g', 'r')):
        hist_original = cv.calcHist([original_img], [i], None, [256], [0, 256])
        hist_encrypted = cv.calcHist([encrypted_img], [i], None, [256], [0, 256])
        hist_decrypted = cv.calcHist([decrypted_img], [i], None, [256], [0, 256])

        plt.subplot(3, 3, i * 3 + 1)
        plt.plot(hist_original, color=col, linestyle='-')
        plt.title(f"{col.upper()} Channel - Original")
        plt.xlabel("Pixel Intensity (0-255)")
        plt.ylabel("Frequency")
        plt.legend(["Original"])

        plt.subplot(3, 3, i * 3 + 2)
        plt.plot(hist_encrypted, color=col, linestyle='-')
        plt.title(f"{col.upper()} Channel - Encrypted")
        plt.xlabel("Pixel Intensity (0-255)")
        plt.ylabel("Frequency")
        plt.legend(["Encrypted"])

        plt.subplot(3, 3, i * 3 + 3)
        plt.plot(hist_decrypted, color=col, linestyle='-')
        plt.title(f"{col.upper()} Channel - Decrypted")
        plt.xlabel("Pixel Intensity (0-255)")
        plt.ylabel("Frequency")
        plt.legend(["Decrypted"])


    plt.tight_layout()
    plt.show()
