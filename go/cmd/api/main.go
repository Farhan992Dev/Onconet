package main

import (
	"flag"
	"log"
	"os"
)

const version = "1.0.0"

type config struct {
	port int
	env  string
}

type application struct {
	config config
	logger *log.Logger
}

func main() {
	var cfg config
	flag.IntVar(&cfg.port, "port", 4000, "Api server port")
	flag.StringVar(&cfg.env, "env", "development", " Environment")
	flag.Parse()

	logger := log.New(os.Stdout, "", log.Ldate|log.LUTC)


	application:= &application{
		config:cfg,
		logger: logger,
	}
}
