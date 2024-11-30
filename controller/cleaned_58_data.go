package controller

import (
	"gin-template/common"
	"gin-template/model"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func GetAll58Datas(c *gin.Context) {
	p, _ := strconv.Atoi(c.Query("p"))
	if p < 0 {
		p = 0
	}
	users, err := model.GetAll58Datas(p*common.ItemsPerPage, common.ItemsPerPage)
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
