var http = require("http");
var fs = require("fs");
var cheerio  = require("cheerio");
var request = require("request");
var i = 0;
var url = "http://www.jucheng.com/html/course_4074.aspx"; 
function fetchPage(x){
    startRequest(x); 
}
function startRequest(x){
    http.get(x,function(res){
       var  html = '';
       var titles = []; 
       res.setEncoding('utf-8'); //防止中文乱码
         //监听data事件，每次取一块数据
         res.on('data', function (chunk) {   
            html += chunk;
        });
        //监听end事件，如果整个网页内容的html都获取完毕，就执行回调函数
        res.on('end',function(){
           var $ = cheerio.load(html); //采用cheerio模块解析html
           var title  = $('.biaoti ').children('h1').text();
           var content = $('.biaoti').siblings('p').text();
           var courseMsgTime =$('.jiage').find('span:first-child').text()
           var courseMsgAddress =$('.jiage').find('span:nth-child(2)').text()
           var courseMsgTeacher =$('.kczx_det').children('dl').children('dd').children('h2').children('a').text()
           var courseMsgPrice ='价格'+$('.jiage_right').find('i').text()
           var teacherContent = $('.kczx_det').children('dl').children('dd').children('p').text()
           var courseImg = $('#kczx_dettop').children('dl').children('dt').children('img').attr('src')
           var teacherImg = $('.kczx_det').children('dl').children('dt').children('a').children('img').attr('src')
           var course = {
               "title":title,
               "content":content,
               "courseMsgTeacher":courseMsgTeacher,
               "teacherContent":teacherContent,
               "courseMsgTime":courseMsgTime,
               "courseMsgAddress":courseMsgAddress,
               "courseMsgPrice":courseMsgPrice,
               "all":title+content+courseMsgTeacher+teacherContent+courseMsgTime+courseMsgAddress+courseMsgPrice,
               "courseImg":courseImg,
               "teacherImg":teacherImg
           }
        
           saveContent(course)
           saveImg(course)
        })
        res.on('error',function(){
            console.log('爬取失败啦!,请查看当前url是否正确')
        })
    })
}
function saveContent(obj){
   fs.appendFile('./data/'+obj.title+'.txt',obj.title+obj.all,'utf-8',function(res){
       console.log(res)
   })
}
function saveImg(obj){
     var requestcourseImg  = 'http://www.jucheng.com'+obj.courseImg
     var requestteacherImg  = 'http://www.jucheng.com'+obj.teacherImg
     request.head(requestcourseImg,function(err,res,body){
          if(err){
              console.log(err)
          }
     })
     request.head(requestteacherImg,function(err,res,body){
        if(err){
            console.log(err)
        }
   })
   request(requestcourseImg).pipe(fs.createWriteStream('./img/'+obj.title + '---课程' + obj.title+'.jpg'));     //通过流的方式，把图片写到本地/image目录下，并用新闻的标题和图片的标题作为图片的名称。
   request(requestteacherImg).pipe(fs.createWriteStream('./img/'+obj.title + '---教师' + obj.courseMsgTeacher+'.jpg'));     //通过流的方式，把图片写到本地/image目录下，并用新闻的标题和图片的标题作为图片的名称。
}

fetchPage(url)