package model

import (
	"encoding/json"
	"io/ioutil"
	"log"
	"math/rand"
	"sort"
	"strings"
)

type WordList struct {
	WordSet []WordSet
}

type WordSet struct {
	LetterSet string
	Words     []string
}

func Load(filepath string) (*WordList, error) {
	content, err := ioutil.ReadFile(filepath)
	if err != nil {
		return nil, err
	}

	var wl WordList
	json.Unmarshal([]byte(content), &wl)

	log.Printf("Loaded %d word sets from file %s", len(wl.WordSet), filepath)

	return &wl, nil
}

func (wl WordList) GetRandomWordSet() *WordSet {
	return &wl.WordSet[rand.Intn(len(wl.WordSet))]
}

func (ws WordSet) IsValidWord(word string) bool {
	loweredWord := strings.ToLower(word)
	idx := sort.SearchStrings(ws.Words, loweredWord)

	if idx >= 0 && idx < len(ws.Words) && ws.Words[idx] == loweredWord {
		return true
	} else {
		return false
	}
}
