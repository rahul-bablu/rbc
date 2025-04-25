import sys
import numpy as np
import cv2 as cv
np.set_printoptions(threshold=sys.maxsize)


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
            return rotate_row(block, num, shifts=2)
        case "D2":
            return rotate_row(block, n - num - 1, shifts=2)
        case "F2":
            return rotate_front(block, shifts=2)
        case "L2'":
            return rotate_col(block, num, shifts=2, clock=-1)
        case "R2'":
            return rotate_col(block, m - num - 1, shifts=2, clock=-1)
        case "U2'":
            return rotate_row(block, num, shifts=2, clock=-1)
        case "D2'":
            return rotate_row(block, n - num - 1, shifts=2, clock=-1)
        case "F2'":
            return rotate_front(block, shifts=2, clock=1)
        case "F":
            return rotate_front(block)
        case "F'":
            return rotate_front(block, shifts=1, clock=1)
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

import numpy as np

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
            bitplane = np.roll(bitplane, (rot_nums[idx] * n * m + offsets[idx]) * -1)
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
    img = shuffle(img)
    k1, k2 = key_reduction(k1, k2)
    return frame_rotation(img, k1, k2)

import hashlib

def string_to_binary_key(input_string, length=128):
    # Use SHA-512 hash
    hash_object = hashlib.sha512(input_string.encode())
    hex_digest = hash_object.hexdigest()

    # Convert hex to binary string
    bin_str = bin(int(hex_digest, 16))[2:].zfill(512)

    # Trim or pad to desired length
    return bin_str[:length]

def decrypt(img, key, salt):
    blocks = [16, 32, 64]
    dec_matrix = [["L'", "R'", "U'", "D'"],
                ["F'", "L", "R", "U"],
                ["D", "F", "L2'", "R2'"],
                ["U2'", "D2'", "F2'", "L'"]]
    rows, cols, _ = img.shape
    # k1="01010100011010000110000101110100011100110010000001101101011110010010000001001011011101010110111001100111001000000100011001110101"
    # k2="11100010001100101111110011110001100100010001001010010001100010001011000101011001111001001110011011010110011110011010001010010011"
    k1 = string_to_binary_key(key)
    k2 = string_to_binary_key(salt)
    img = bitplane_shuffling(img, k1, k2)
    for block_size in blocks[::-1]:
        newk1, newk2 = k1, k2
        for i in range(0, rows, block_size):
            newk1, newk2 = update_keys(newk1, newk2, i // block_size)
            seq = scrambling_seq(newk1, newk2)[::-1]
            for j in range(0, cols, block_size):
                img[i:i+block_size, j:j+block_size] = scramble_img(dec_matrix, seq, img[i:i+block_size, j:j+block_size], block_size)
    return img

