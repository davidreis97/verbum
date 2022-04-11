package logic

import (
	"encoding/json"
	"io/ioutil"
	"math/rand"
	"sort"
	"strings"

	"github.com/davidreis97/verbum/verbum-gamehost/src/log"
)

type WordList struct {
	WordSet []WordSet
}

type WordSet struct {
	LetterSet string
	Words     []string
}

func LoadWordlist(filepath string) (*WordList, error) {
	content, err := ioutil.ReadFile(filepath)
	if err != nil {
		return nil, err
	}

	var wl WordList
	json.Unmarshal([]byte(content), &wl)

	log.Logger.Sugar().Infow("Loaded word sets from file", "wordsetCount", len(wl.WordSet), "filepath", filepath)

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
