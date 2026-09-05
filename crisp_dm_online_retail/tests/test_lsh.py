from src.lsh import MinHashLSH, jaccard, shingles

def test_jaccard_identity():
    a = {"red", "mug"}
    assert jaccard(a, a) == 1.0

def test_lsh_returns_query_item():
    docs = {1: shingles("red heart mug"), 2: shingles("red heart coffee mug"), 3: shingles("garden shovel")}
    lsh = MinHashLSH(num_perm=64, bands=16)
    for i, tokens in docs.items():
        lsh.add(i, tokens)
    assert 1 in lsh.query(docs[1])
