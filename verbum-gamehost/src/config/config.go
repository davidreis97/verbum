package config

import (
	"fmt"
	"os"

	"github.com/fsnotify/fsnotify"
	"github.com/spf13/viper"
)

func init() {
	InitializeDefaults()
	//config.save() // Uncomment to save default values to file (OVERWRITES EXISTING FILE)
	Load()
	Watch()
}

func InitializeDefaults() {
	viper.SetDefault("starting_timer", "15")
	viper.SetDefault("ongoing_timer", "120")
	viper.SetDefault("finished_timer", "15")
	viper.SetDefault("allowed_origins", []string{"http://localhost:3000"})
	viper.SetDefault("wordlist", "./wordlist3.txt")
	viper.SetDefault("max_players", "10")
	viper.SetDefault("bind_address", "0.0.0.0:80")
	viper.SetDefault("monitoring", "false")
	viper.SetDefault("tls_cert", "")
	viper.SetDefault("tls_key", "")
}

func IsProd() bool {
	return os.Getenv("ENV") == "PRODUCTION"
}

func Load() {
	viper.SetConfigType("json")
	viper.AddConfigPath("/etc/verbum-gamehost/")  // path to look for the config file in
	viper.AddConfigPath("$HOME/.verbum-gamehost") // call multiple times to add many search paths
	viper.AddConfigPath(".")

	if IsProd() {
		viper.SetConfigName("config")
	} else {
		viper.SetConfigName("devconfig")
	}

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
	err := viper.WriteConfigAs("./config_defaults.json")
	if err != nil {
		panic(fmt.Errorf("Fatal error config file: %w \n", err))
	}
}
