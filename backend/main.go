package main

import (
	"log"
	"os"
	"pengaduan/config"
	"pengaduan/routes"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	godotenv.Load()
	config.InitDB()

	for _, dir := range []string{
		"assets/pengaduan",
		"assets/bukti",
		"assets/permohonan/ktp",
		"assets/permohonan/kk",
		"assets/permohonan/pendukung",
		"assets/permohonan/hasil",
		"assets/permohonan/rtrw",
		"assets/permohonan/rumah",
	} {
		_ = os.MkdirAll(dir, 0755)
	}

	r := gin.Default()
	r.Use(cors.New(cors.Config{
		// AllowOrigins:     []string{"http://localhost:5173"}, // Hanya izinkan FrontEnd/ atau FE di port 5173
		AllowAllOrigins: true, // Izinkan akses dari Frontend FE semua port
		AllowMethods:    []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:    []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:   []string{"Content-Length"},
		// AllowCredentials: true, // Jika hanya port tertentu uncomment yang ini
		AllowCredentials: false, // Jika semua port pakai yang ini
	}))
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})
	r.Static("/assets", "./assets")
	routes.SetupRoutes(r)
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("Server berjalan di port %s", port)
	r.Run(":" + port)
}
