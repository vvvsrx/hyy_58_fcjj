package model

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
	"log"
	"time"
)

type Cleaned58Data struct {
	Id         int       `json:"id"`
	UId        int       `gorm:"not null" json:"uid"`
	OLink      string    `gorm:"type:text" json:"olink,omitempty"`
	Img        string    `gorm:"type:text" json:"img,omitempty"`
	Name       string    `gorm:"type:text;not null" json:"name"`
	Score      string    `gorm:"type:text" json:"score,omitempty"`
	City       string    `gorm:"type:text" json:"city,omitempty"`
	Status     int       `gorm:"default:0;not null" json:"status"`
	UpdateTime time.Time `gorm:"type:datetime" json:"updatetime"`
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

func GetAll58Datas(startIdx int, num int) (data []*Cleaned58Data, err error) {
	err = DB.Order("updatetime desc").Limit(num).Offset(startIdx).Select([]string{"id", "uid", "olink", "img", "name", "score", "city", "status", "updatetime", "parameter"}).Find(&data).Error
	for _, user := range data {
		// formattedTime := user.UpdateTime.Format(time.RFC3339)
		// common.SysLog(formattedTime)
		log.Printf("Fetched data: %+v", user)
	}
	return data, err
}

func Search58Datas(keyword string) (data []*Cleaned58Data, err error) {
	err = DB.Select([]string{"id", "uid", "olink", "img", "name", "score", "city", "status", "updatetime", "parameter"}).Where("id = ? or name LIKE ?", keyword, keyword+"%").Find(&data).Error
	return data, err
}
