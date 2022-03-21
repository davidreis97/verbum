package config

import (
	"fmt"

	"github.com/fsnotify/fsnotify"
	"github.com/spf13/viper"
)

func InitializeDefaults() {
	viper.SetDefault("starting_timer", "15")
	viper.SetDefault("ongoing_timer", "120")
	viper.SetDefault("finished_timer", "15")
	viper.SetDefault("vowel_count", "3")
	viper.SetDefault("consonant_count", "4")
}

func Load() {
	viper.SetConfigName("config")
	viper.SetConfigType("json")
	viper.AddConfigPath("/etc/verbum-gamehost/")  // path to look for the config file in
	viper.AddConfigPath("$HOME/.verbum-gamehost") // call multiple times to add many search paths
	viper.AddConfigPath(".")

	err := viper.ReadInConfig() // Find and read the config file
	if err != nil {             // Handle errors reading the config file
		panic(fmt.Errorf("Fatal error config file: %w \n", err))
	}
}

func Watch() {
	viper.OnConfigChange(func(e fsnotify.Event) {
		fmt.Println("Config file changed:", e.Name)
	})
	viper.WatchConfig()
}

func Save() {
	err := viper.WriteConfigAs("./config.json")
	if err != nil {
		panic(fmt.Errorf("Fatal error config file: %w \n", err))
	}
}
