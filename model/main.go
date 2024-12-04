package model

import (
	"gin-template/common"
	"os"

	"gorm.io/driver/mysql"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB

func createRootAccountIfNeed() error {
	var user User
	//if user.Status != common.UserStatusEnabled {
	if err := DB.First(&user).Error; err != nil {
		common.SysLog("no user exists, create a root user for you: username is root, password is 123456")
		hashedPassword, err := common.Password2Hash("123456")
		if err != nil {
			return err
		}
		rootUser := User{
			Username:    "root",
			Password:    hashedPassword,
			Role:        common.RoleRootUser,
			Status:      common.UserStatusEnabled,
			DisplayName: "Root User",
		}
		DB.Create(&rootUser)
	}
	return nil
}

func CountTable(tableName string) (num int64) {
	DB.Table(tableName).Count(&num)
	return
}

func InitDB() (err error) {
	var db *gorm.DB
	if os.Getenv("SQL_DSN") != "" {
		// Use MySQL
		//export SQL_DSN=hyy_example:W7s8fKBmxjXAiKPn@tcp(192.168.3.7:3306)/hyy_example?charset=utf8mb4&parseTime=True&loc=Local
		// db, err = gorm.Open(mysql.Open(os.Getenv("SQL_DSN")), &gorm.Config{
		// 	PrepareStmt: true, // precompile SQL
		// })
		db, err = gorm.Open(mysql.Open("hyy_example:W7s8fKBmxjXAiKPn@tcp(192.168.3.7:3306)/hyy_example?charset=utf8mb4&parseTime=True&loc=Local"), &gorm.Config{
			PrepareStmt: true, // precompile SQL
		})
	} else {
		// Use SQLite
		db, err = gorm.Open(sqlite.Open(common.SQLitePath), &gorm.Config{
			PrepareStmt: true, // precompile SQL
		})
		common.SysLog("SQL_DSN not set, using SQLite as database")
	}
	if err == nil {
		DB = db
		err := db.AutoMigrate(&File{})
		if err != nil {
			return err
		}
		err = db.AutoMigrate(&User{})
		if err != nil {
			return err
		}
		err = db.AutoMigrate(&Option{})
		if err != nil {
			return err
		}
		err = db.AutoMigrate(&Cleaned58Data{})
		if err != nil {
			return err
		}
		err = createRootAccountIfNeed()
		return err
	} else {
		common.FatalLog(err)
	}
	return err
}

func CloseDB() error {
	sqlDB, err := DB.DB()
	if err != nil {
		return err
	}
	err = sqlDB.Close()
	return err
}
