import json
import sys
import itertools

vowels = "AEIOU" # C(5,3) = 10
consonants = "BCDFGHJKLMNPQRSTVWXYZ" # C(21,4) = 5985

vowelCombs = set(itertools.combinations(vowels, 3))
consonantCombs = set(itertools.combinations(consonants, 4))

print("Vowel combs: ", len(vowelCombs))
print("Consonant combs: ", len(consonantCombs))

possibleSets = list([frozenset({V1,V2,V3,C1,C2,C3,C4}) for ((V1,V2,V3),(C1,C2,C3,C4)) in itertools.product(vowelCombs, consonantCombs)])

print("Possible Sets: ", len(possibleSets))

words = []

with open(sys.argv[1]) as f:
    words = list([(frozenset(word.upper()), word) for word in filter(lambda word: not word.endswith('s') and len(word) > 1, f.read().splitlines())])

print("File processed ", len(words), " words")

scores = {}

count = 0

for set in possibleSets:
    count += 1
    for (wordSet, word) in words:
        if wordSet <= set:
            if set not in scores:
                scores[set] = []
            scores[set].append(word)
    if count % 5000 == 0:
        print(count, " / ", len(possibleSets))

scores = {k: v for k, v in sorted(scores.items(), key=lambda item: len(item[1]), reverse=True)}

f = open("output_with_words.json", "w")
json.dump({"wordset": [{"letterset": "".join(set), "words": scores[set]} for set in scores.keys()]}, f)