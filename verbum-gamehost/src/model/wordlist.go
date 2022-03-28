package model

type WordList struct {
	WordSet []WordSet
}

type WordSet struct {
	LetterSet string
	Words     []string
}
