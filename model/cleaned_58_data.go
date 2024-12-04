package model

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
	"time"
)

type Cleaned58Data struct {
	Id         int       `json:"id"`
	UId        int       `gorm:"not null" json:"uid"`
	Olink      string    `gorm:"type:text" json:"olink,omitempty"`
	Img        string    `gorm:"type:text" json:"img,omitempty"`
	Name       string    `gorm:"type:text;not null" json:"name"`
	Score      string    `gorm:"type:text" json:"score,omitempty"`
	City       string    `gorm:"type:text" json:"city,omitempty"`
	Status     int       `gorm:"default:0;not null" json:"status"`
	Updatetime time.Time `gorm:"type:datetime" json:"updatetime"`
	Parameter  JSONSlice `gorm:"type:json" json:"parameter,omitempty"`
}

func (Cleaned58Data) TableName() string {
	return "cleaned_58_data"
}

// JSONSlice 定义了一个用于处理 []string 类型的整合封装
type JSONSlice []string

// Scan 实现 sql.Scanner 接口，将数据库值转换为 JSONSlice
func (js *JSONSlice) Scan(value interface{}) error {
	if value == nil {
		*js = []string{}
		return nil
	}

	bytes, ok := value.([]byte)
	if !ok {
		return errors.New("type assertion to []byte failed")
	}

	return json.Unmarshal(bytes, js)
}

// Value 实现 driver.Valuer 接口，将 JSONSlice 转换为数据库可存储的值
func (js JSONSlice) Value() (driver.Value, error) {
	return json.Marshal(js)
}

func GetAll58Datas(startIdx int, num int, city string, dayType int, name string, status int) (data []*Cleaned58Data, err error) {
	var tx = DB
	if city != "" {
		tx = tx.Where("city = ?", city)
	}
	if name != "" {
		tx = tx.Where("name = ?", name)
	}
	if status >= 0 {
		tx = tx.Where("status = ?", status)
	}
	if dayType > 0 {
		switch dayType {
		case 1: //今天
			tx = tx.Where("updatetime >= CURDATE() AND updatetime < CURDATE() + INTERVAL 1 DAY")
		case 2:
			tx = tx.Where("DATE(updatetime) = CURDATE() - INTERVAL 1 DAY")
		}
	}
	err = tx.Order("updatetime desc").Limit(num).Offset(startIdx).Select([]string{"id", "uid", "olink", "img", "name", "score", "city", "status", "updatetime", "parameter"}).Find(&data).Error
	return data, err
}

func GetAllCities() (cities []*string, err error) {
	err = DB.Model(&Cleaned58Data{}).Select("DISTINCT city").Scan(&cities).Error
	return cities, err
}

func Search58Datas(keyword string) (data []*Cleaned58Data, err error) {
	err = DB.Select([]string{"id", "uid", "olink", "img", "name", "score", "city", "status", "updatetime", "parameter"}).Where("id = ? or name LIKE ?", keyword, keyword+"%").Find(&data).Error
	return data, err
}
