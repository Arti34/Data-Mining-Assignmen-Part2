import hashlib
import numpy as np
from collections import defaultdict

def shingles(text, k=3):
    s = " ".join(str(text).lower().split())
    if len(s) <= k:
        return {s}
    return {s[i:i+k] for i in range(len(s)-k+1)}

def _hash(token, seed):
    h = hashlib.blake2b(f"{seed}|{token}".encode(), digest_size=8).digest()
    return int.from_bytes(h, "little", signed=False)

def minhash_signature(tokens, num_perm=64, prime=4294967311):
    if not tokens:
        return np.full(num_perm, prime, dtype=np.uint64)
    sig = np.full(num_perm, prime, dtype=np.uint64)
    for i in range(num_perm):
        sig[i] = min(_hash(t, i) % prime for t in tokens)
    return sig

class MinHashLSH:
    """Educational MinHash LSH implementation."""
    def __init__(self, num_perm=64, bands=16):
        if num_perm % bands != 0:
            raise ValueError("num_perm must be divisible by bands")
        self.num_perm = num_perm
        self.bands = bands
        self.rows = num_perm // bands
        self.tables = [defaultdict(set) for _ in range(bands)]
        self.signatures = {}

    def add(self, item_id, tokens):
        sig = minhash_signature(tokens, self.num_perm)
        self.signatures[item_id] = sig
        for b in range(self.bands):
            start = b * self.rows
            key = tuple(int(v) for v in sig[start:start+self.rows])
            self.tables[b][key].add(item_id)

    def query(self, tokens):
        sig = minhash_signature(tokens, self.num_perm)
        candidates = set()
        for b in range(self.bands):
            start = b * self.rows
            key = tuple(int(v) for v in sig[start:start+self.rows])
            candidates |= self.tables[b].get(key, set())
        return candidates

def jaccard(a, b):
    a, b = set(a), set(b)
    if not a and not b:
        return 1.0
    return len(a & b) / len(a | b)
