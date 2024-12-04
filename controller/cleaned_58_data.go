package controller

import (
	"bytes"
	"encoding/json"
	"gin-template/common"
	"gin-template/model"
	"io"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

func GetAll58Datas(c *gin.Context) {
	p, _ := strconv.Atoi(c.Query("p"))
	if p < 0 {
		p = 0
	}
	dayType, _ := strconv.Atoi(c.Query("dayType"))
	if p < 0 {
		p = 0
	}
	status, _ := strconv.Atoi(c.Query("status"))
	city := c.Query("city")
	name := c.Query("name")
	users, err := model.GetAll58Datas(p*common.ItemsPerPage, common.ItemsPerPage, city, dayType, name, status)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data":    users,
	})
	return
}

func GetAllCities(c *gin.Context) {

	cities, err := model.GetAllCities()
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data":    cities,
	})
	return
}

func Search58Datas(c *gin.Context) {
	keyword := c.Query("keyword")
	users, err := model.Search58Datas(keyword)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data":    users,
	})
	return
}

func GetAll58Phone(c *gin.Context) {
	uid, _ := strconv.Atoi(c.Query("uid"))
	if uid < 100 {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "uid < 100",
		})
		return
	}
	url := "https://broker.58.com/esf-ajax/qrcode/get/"

	// 设置请求体
	bodyData := map[string]interface{}{
		"city_id": 891,
		"twUrl":   nil,
		"extParams": map[string]interface{}{
			"qr_type":                     "pc_esfjjr",
			"broker_id":                   uid,
			"Web_Broker_ShopPage_dianhua": uid,
			"soj_flag":                    "{}",
			"ft":                          "ft",
			"city_id":                     "891",
			"call_up":                     "1",
		},
		"redirectTo":  "/page/taroPage/brokers/pages/view/view",
		"isNewQrCode": 1,
	}
	bodyBytes, err := json.Marshal(bodyData)
	if err != nil {
		common.SysLog("bodyBytes, err := json.Marshal(bodyData)")
		common.SysLog(err.Error())
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	// 创建请求
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(bodyBytes))
	if err != nil {
		common.SysLog("req, err := http.NewRequest(\"POST\", url, bytes.NewBuffer(bodyBytes))")
		common.SysLog(err.Error())
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	// 设置请求头
	req.Header.Set("Accept", "application/json, text/plain, */*, application/x-json, */*;q=0.01")
	req.Header.Set("Accept-Language", "zh-CN,zh;q=0.9")
	req.Header.Set("Content-Type", "application/json;charset=UTF-8")

	// 发送请求
	client := http.Client{
		Timeout: 5 * time.Second,
	}
	resp, err := client.Do(req)
	if err != nil {
		common.SysLog("resp, err := client.Do(req)")
		common.SysLog(err.Error())
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}
	defer resp.Body.Close()

	// 读取响应
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		common.SysLog("body, err := io.ReadAll(resp.Body)")
		common.SysLog(err.Error())
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}
	common.SysLog(string(body))

	// 解析 JSON 响应
	var responseJSON map[string]interface{}
	if err := json.Unmarshal(body, &responseJSON); err != nil {
		common.SysLog("json.Unmarshal(body, &responseJSON); err != nil")
		common.SysLog(err.Error())
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}
	time.Sleep(3 * time.Second)
	// 提取 miniappHref
	if data, ok := responseJSON["data"].(map[string]interface{}); ok {
		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"data":    data,
			"message": "",
		})
		return
	} else {
		common.SysLog("responseJSON[\"data\"].(map[string]interface{});")
		common.SysLog(err.Error())
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}
}
