/******* config ***********/

var stopID    = 10003177; // 独墅湖图书馆id
var stopName  = "独墅湖图书馆";
var lineID    = "10000522";
var busName   = "110(南线)";
var url       = "http://app.2500.tv/bus1/api_line_status_a.php";
var result    = "未知";
var current   = 200;

/******* UI ***********/



var templateCell = {
  props: {
    bgcolor: $color("clear")
  },
  views: [{
    type: "label",
    props: {
      id: "stopNameLabel",
      align: $align.center,
      font: $font(20)
    },
    layout: function(make, view) {
      make.left.inset(20)
      make.centerY.equalTo(0);
    }
  },
    {
      type: "label",
      props: {
        id: "busNoLabel",
        textColor: $color("#3399ff"),
        align: $align.center,
        font: $font(15)
      },
      layout: function(make, view) {
        make.right.inset(10)
        make.centerY.equalTo(0);
      },
  }]
}

var listView = {
  type: "list",
  props: {
    id: 'listView',
    template: templateCell,
    data: []
  },
  layout:function(make, view) {
    make.left.right.bottom.inset(0)
    make.top.equalTo(80)
  },
}

var topView = {
  type: "label",
  props: {
    id:'topLabel',
    textColor: $color("#3399ff"),
    text: "正在请求....",
    autoFontSize: true,
    align: $align.center,
    lines: 0,
  },
  layout: function(make, view) {
    make.top.left.right.inset(0);
    make.height.equalTo(80);
  },
  
}

$ui.render({
  views: [
    topView,
    listView
  ]
})

/******* Network ***********/
$http.post({
  url: url,
  form: {
    lineID: lineID
  },
  handler: function (resp) {
    handleBusResponse(resp);
  }
});


// 处理接口数据
function handleBusResponse(resp) {
  var data = resp.data.data;
  var busArray = [];

  if (resp.data.status == 1) {
    for (var i in data) {
      var busStop = data[i];
      if (busStop.ID == stopID) { // 遍历到目的站点

        if (current == 200) {
          result = "在" + stopName + "之前没有" + busName + "运行";
        } else if (busStop.BusInfo.length == 0) {
          result = i - current == 0 ? busName + "刚刚到达" + stopName : busName + "还有" + (i - current) + "站路到达" + stopName
        } else {
          var next = "\n下一班还有" + (i - current) + "站路到达"
          result = busStop.BusInfo + "于" + busStop.InTime + "到达" + stopName + next;
        }
        busArray.push(busStop);
        break;
      } else {// 未遍历到目的站点

        if (busStop.BusInfo.length > 0) { // 有车
          current   = i;
          busArray  = [];
          busArray  = [busStop];
        } else { // 没有车 
          busArray.push(busStop);
        }
      }

    }
    // $ui.alert(result);
    /** 更新UI **/
    var label     = $("topLabel");
    label.text    = result;
    var dataArray = [];
    for(var i in busArray){
      var busStop = busArray[i];
      var j       = i + 1.0;
      var obj     = {
          stopNameLabel: {
          text: (parseInt(i)+1) + busStop.StationCName
        },
          busNoLabel:{
          text: busStop.BusInfo.length > 0 ? busStop.BusInfo + " " + busStop.InTime : ""
        }
      }
      dataArray.push(obj);
    }

    var list    = $("listView");
    list.data   = dataArray;

  } else {

    $ui.alert("错误");
  }

}
