/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import Visualization from 'zeppelin-vis';
import PassthroughTransformation from 'zeppelin-tabledata/passthrough';
import agGrid from 'ag-grid/dist/ag-grid';
import $ from "jquery";
import ColumnselectorTransformation from 'zeppelin-tabledata/columnselector';//列选择器


/**
 * Visualize data in table format
 */
$.fn.rSelectColor = function(options){
    var defaults = {
        containerId: 'rylColor',
        left: 50,
        top: 0,
        defaultColor: '#000'
    };
    defaults.customColor = [
        '#fff','#000','#eeece1','#1f497d','#4f81bd',
        '#c0504d','#9bbb59','#8064a2','#4bacc6','#f79646',
        '#f2f2f2','#808080','#ddd9c3','#c6d9f1','#dce6f2',
        '#f2dcdb','#ebf1de','#e6e0ec','#dbeef4','#fdeada',
        '#d9d9d9','#595959','#c4bd97','#8eb4e3','#b9cde5',
        '#e6b9b8','#d7e4bd','#ccc1da','#b7dee8','#fcd5b5',
        '#bfbfbf','#404040','#948a54','#558ed5','#95b3d7',
        '#d99694','#c3d69b','#b3a2c7','#93cddd','#fac090',
        '#a6a6a6','#262626','#4a452a','#17375e','#376092',
        '#953735','#77933c','#604a7b','#31859c','#e46c0a',
        '#7f7f7f','#0d0d0d','#1e1c11','#10243f','#254061',
        '#632523','#4f6228','#403152','#215968','#984807'
    ];
    defaults.formatColor = [
        '#c00000','#ff0000','#ffc000','#ffff00','#92d050',
        '#00b050','#00b0f0','#0070c0','#002060','#7030a0'
    ];

    var settings = $.extend(defaults,options);
    var elems = this;
    var cur_elem;

    var event = function(){
        $(elems).each(function(){
            $(this).click(function(){
                show(this);
            });
        });
        $('#' + settings.containerId).find('.raCol').click(function(){
            onSelect(this);
        });
    };
    var build = function(){
        var containerId = settings.containerId;
        var containerDiv = $('<div id="'+ containerId+'" class="rylColor" style="display: none"></div>');
        var defaultDiv = $('<div class="rylColor-default"></div>');
        var customDiv = $('<div class="rylColor-custom"></div>');
        var formatDiv = $('<div class="rylColor-format"></div>');

        defaultDiv.append('<span class="raCol" style="background-color: '+ settings.defaultColor +'" title="'+settings.defaultColor +'"></span>自动');
        var liHtml = '';
        $.each(settings.customColor,function(i,e){
            liHtml += '<li class="raCol" data-color="'+e+'" style="background-color: '+ e +'" title="'+ e +'"></li>';
        });
        customDiv.append('<div class="rtitle">主题颜色</div><ul>'+liHtml+'</ul>');

        liHtml = '';
        $.each(settings.formatColor,function(i,e){
            liHtml += '<li class="raCol" data-color="'+e+'" style="background-color: '+e+'" title="'+ e +'"></li>';
        });
        customDiv.append('<div class="rtitle">标准色</div><ul>'+liHtml+'</ul>');

        if($('#' + containerId).length == 0){
            //不存在，则创建
            $('body').append(containerDiv);
        }
        containerDiv.append(defaultDiv,customDiv,formatDiv);

    }
    var show = function(elem){
        cur_elem = elem;
        var top = $(elem).offset().top;
        var left = $(elem).offset().left;
        $('#' + settings.containerId).css({
            top: top + settings.top,
            left: left + settings.left,
        }).fadeIn();
    };
    var onSelect = function(selectOne){
        $('#'+ settings.containerId).fadeOut();
        if(options.onSelect){
            options.onSelect(selectOne,cur_elem);
        }
    };

    build();
    event();
}
var robj=new Object();
//robj.InitFlag=true;
var rmyagGrid;
export default class RSogouMapTable extends Visualization {
    constructor(targetEl, config) {
        super(targetEl, config);
        console.log('routeid routeid start constructor called...');
        /*选择器相关*/
        const columnSpec = [
            { name: 'RouteId'},
            { name: 'Kind'},
            { name: 'HeatMap-Val'},
            { name: 'MapTip'}
        ];
        this.transformation = new ColumnselectorTransformation(config, columnSpec);//tab栏设

        //robj.InitFlag=true;
        this.gridOptions = {
            enableSorting: true,
            enableFilter: true,
            enableGridMenu: true,
            modifierKeysToMultiSelectCells: true,
            rowSelection:'multiple',/*行选择类型*/
            rowMultiSelectWithClick:true,/*设置为true以允许使用单击选择多行*/
            rowDeselection:true,/*如果为true，按住Ctrl并点击改行，则将取消选择行*/
            showToolPanel:true,/*设置为true以默认显示工具面板*/
            singleClickEdit:true
        };

        //为表格设置点击事件
        this.gridOptions.onRowClicked=function(ev){
            var routeID=ev.data.routeid;
            var url ="http://10.142.90.171:18080/navi/debug/route?routeid=" + routeID +"&callback=?";
            $.getJSON(url,function(data){
                if(typeof(data.err)!="undefined"&&data.err.length>0){
                    alert("Not found routeID!");
                }else{
                    var strs = data.links[0].line.split(",");
                    mySetCenter(strs[0],strs[1]);
                    //定位到中心时顺便把该条线以黑色标识出来
                    var linkStyleObj=new Object();
                    linkStyleObj.strokeColor="black";
                    linkStyleObj.strokeWeight=8;
                    drawLinks(data, false, 0, linkStyleObj, "");
                }
            });
            console.log("routeid 表格行被单击了...");
        };

        this.passthrough = new PassthroughTransformation(config);
        this.targetEl = targetEl[0];
        //修改表的布局
        this.targetEl.style="position:relative;height:100%;width:40%;float:left";
        this.targetEl.classList.add('ag-fresh');
        //改造表格的功能选项

        this.destroyLayout();

        console.log('routeid end constructor called...'+'targetEl:');
    };

    //加载搜狗地图第三方api库
    loadapi(){//infoArray 暂时把参数移出去
            console.log("routeid loadapi() called ...");
            var sogouMapID="rsogoumap"+this.targetEl.id;
            if(!$("#go2map")[0]){
                var scriptdom = document.createElement('script');
                scriptdom.id="go2map";
                scriptdom.src='http://api.go2map.com/maps/js/api_v2.5.1.js';
                scriptdom.onload=function(){
                    //初始化搜狗地图
                    if(typeof(rsogouMap)=="undefined"||rsogouMap==null) {
                        console.log("routeid onload() initSogouMap()...");
                        rsogouMap = initSogouMap(sogouMapID);
                    }
                }
                document.body.appendChild(scriptdom)
            }else{
                if(typeof(rsogouMap)=="undefined"||rsogouMap==null){
                    console.log("routeid initSogouMap()...exist go2map");
                    rsogouMap=initSogouMap(sogouMapID);
                }
            }
    }

    getTransformation() {
        console.log('routeid getTransformation() called...'+'passthrough:'+this.passthrough.toString());
        return this.transformation;///*列选择器相关*/this.passthrough
    };

    // setConfig(config) {
    //     console.log('setConfig(config) called...');
    //     this.transformation.setConfig(config);//为了列选择器增加的
    //     this.pivot.setConfig(config);
    // };

    type() {
        console.log('routeid type() called...');
        return 'agGrid';
    };

    activate() {
        if (!this._active || this._dirty) {
            this.refresh();
            this._dirty = false;
        }
        this._active = true;
        console.log(" routeid 可视化插件被选中...")
    };

    /**
     * Refresh visualization.
     */
    refresh() {
        // override this
        console.warn('routeid A chart is missing refresh function, it might not work preperly');
    }

    /**
     * Activate. 当可视化插件取消选择后唤醒
     */
    deactivate() {
        this._active = false;
        console.log("routeid deactivate() called ...");
       this.destroyLayout();
    };

    destroy() {
        // override this
        console.log("routeid destroy() called ...");
        this.destroyLayout();
    }

    render(data) {
        console.log('routeid rener(data) called...');//JSON.stringify(data)

        var tableID="#"+this.targetEl.id;
        $(tableID).empty();


        this.initLayout();
        this.loadapi();


        let columnDefs = data.columns.map(col => {
            return {'headerName': col.name, 'field': col.name.toLowerCase()}
        });
        let rowData = data.rows.map(row => {
            let obj = {};
            columnDefs.forEach((col, idx) => {
                obj[col.field] = row[idx];
             });
            return obj;
         });

        this.gridOptions.columnDefs=columnDefs;
        this.gridOptions.rowData=rowData;

        // if(typeof(rmyagGrid)=="undefined"){//||rmyagGrid==null
        //     rmyagGrid=new agGrid.Grid(this.targetEl, this.gridOptions);
        // }
        new agGrid.Grid(this.targetEl, this.gridOptions);

        robj.gridOptions=this.gridOptions;

        this.createMapDataModel(data);

    };

    /*创建地图数据模型*/
    createMapDataModel(data){
        console.log("routeid createMapDataModel(data) called ...");
        const getColumnIndex = function(config, fieldName, isOptional) {
            var fieldConf = config[fieldName]
            if(fieldConf instanceof Object) {
                return fieldConf.index
            } else if(isOptional) {
                return -1
            } else {
                // throw {
                //     message: "Please set " + fieldName + " in Settings"
                // }
                console.log("routeid message: Please set " + fieldName + " in Settings");
            }
        };

        const config = this.getTransformation().config;
        const routeidIdx = getColumnIndex(config, 'RouteId');
        const kindIdx=getColumnIndex(config, 'Kind');
        const tipIdx=getColumnIndex(config, 'MapTip');
        const hmIdx=getColumnIndex(config, 'HeatMap-Val');

        if (typeof(robj.kindIdx) == "undefined") {
            robj.kindIdx=kindIdx;
        }
        if(typeof(robj.hmIdx) == "undefined"){
            robj.hmIdx=hmIdx;
        }

        //处理kind字段的数据 kindIdx
        var kindSet=new Set() ;
        var kindRows=new Array();//为了和画图数据geoDataRows相对于
        for(var i=0;i<data.rows.length;i++){
            var set=data.rows[i][kindIdx];
            if(typeof(set)!="undefined"){
                kindSet.add(set);
                kindRows.push(set);
            }
        }

        var rlinestyleID="#rlinestyle"+this.targetEl.id;
        var rheatmapstyleID="#rheatmapstyle"+this.targetEl.id;
        $(rlinestyleID).show();
        $(rheatmapstyleID).hide();
        if(typeof(hmIdx)!="undefined") {//调出热力图
            $(rlinestyleID).hide();
            $(rheatmapstyleID).show();
        }
//==================绑定style的风格:start==============================================
        var lineStyleMap=new Map();
        var hmMap=new Map();
        var pointStyleMap=new Map();
        if(robj.kindIdx!=kindIdx||robj.hmIdx!=hmIdx){//更换Kind字段后，清空表中的内容
            pointStyleMap.clear();
            lineStyleMap.clear();
            hmMap.clear();
            robj.kindIdx=kindIdx;
            robj.hmIdx=hmIdx;
        }

        var rmaptableID="#rmaptable"+this.targetEl.id;
        var rltitleID="#rltitle"+this.targetEl.id;
        if($(rlinestyleID).is(':visible')){
            $(rmaptableID).empty();
            //设置默认值
            if(!$(rltitleID)[0]){
                $(rmaptableID).append("<tr id='rltitle"+this.targetEl.id+"'><td>Kind</td><td>Color</td><td>Weight</td></tr>");
            }
            var ccindex=0;
            kindSet.forEach(function(element, sameElement, set){
                var id="#rtrl"+element;
                if(!$(id)[0]){
                    $(rmaptableID).append("<tr id='rtrl"+element+"'><td>"+element+"</td><td id='rcolor"+ccindex+"' class='rstrokecolor' style='background-color:"+colors[ccindex%colors.length]+"'></td><td><input id='in"+ccindex+"' class='strokeweight' type='text' style= 'position:relative;width:25px' value=4 placeholder='4'/></td></tr>");
                }else{
                    $(id).html("<td>"+element+"</td><td id='rcolor"+ccindex+"' class='rstrokecolor' style='background-color:"+colors[ccindex%colors.length]+"'></td><td><input id='in"+ccindex+"' class='strokeweight' type='text' style= 'position:relative;width:25px' value=4 placeholder='4'/></td>");
                }
                //同时将格式添加到lineStyleMap
                var InitLineStyle=new Object();
                InitLineStyle.strokeColor=$(id).children('td').eq(1).css("background-color");
                InitLineStyle.strokeWeight=$(id).find("input").val();
                lineStyleMap.set(element+"",InitLineStyle);
                //给每个input元素设置值改变出发的事件
                $(id).find("input").change(function(){
                    var key=$(id).attr("id").replace("rtrl","");
                    lineStyleMap.get(key).strokeWeight=$(id).find("input").val();
                });
                ccindex=ccindex+1;
            });
            kindSet.clear();

            //表格颜色点击事件
            $('#rylColor').remove();
            $('.rstrokecolor').rSelectColor({
                left: 220,
                onSelect: function(oCol,elem){
                    var color = $(oCol).attr('data-color');
                    //$(elem.outerHTML).css({'background-color':color});
                    var id="#"+elem.id;
                    $(id).css({'background-color':color});
                    var kindKey=elem.parentNode.id;
                    kindKey=kindKey.replace("rtrl","");
                    lineStyleMap.get(kindKey).strokeColor=color;
                }
            });
        }
//==================绑定style的风格:end================================================

//==================画point,line,bound的逻辑:start=========================================
        //画线
        var rlineyesID="#rlineyes"+this.targetEl.id;
        var clockID="#rclock"+this.targetEl.id;
        $(rlineyesID).click(function(){
            var colorindex=0;
            if(typeof(routeidIdx)!="undefined"){
                //展示加载动画
                $(clockID).css("visibility","visible");
                $(clockID).css("overflow","visible");

                for(var i=0;i<data.rows.length;i++){
                        //根据linkid网络请求获得数据
                    if(data.rows.length>10){
                        alert("通过routeid画线的效率较慢，routeID的数量最好不要超过10！");
                    }
                    var routeID=data.rows[i][routeidIdx];//获得linkid
                    var title;
                    if(typeof(tipIdx)!="undefined"){
                        title=i+":"+data.rows[i][tipIdx].name+":"+data.rows[i][tipIdx];
                    }else{
                        title=i+":please set tip!";
                    }
                    if(lineStyleMap.size==0){//选择器kind字段中没有值的时候
                        var linkStyleObj=new Object();
                        linkStyleObj.strokeColor=colors[colorindex%colors.length];
                        linkStyleObj.strokeWeight=4;
                        queryRoute(routeID+"", linkStyleObj, title);
                    }else {
                        queryRoute(routeID+"", lineStyleMap.get(kindRows[i]+""), title);
                    }
                    colorindex=colorindex+1;
                }
                //关闭加载动画
                setTimeout(function(){
                    $(clockID).css("visibility","hidden");
                    $(clockID).css("overflow","hidden");
                },3000);
            }else{
                console.log("routeid Please bind the corresponding data!");
            }
        });
        var rlinenoID="#rlineno"+this.targetEl.id;
        $(rlinenoID).click(function(){
            rsogouMap.clearAll();
        });

//==================画point,line,bound的逻辑:end===========================================

//==================画热力图逻辑:start=================================================
        var maxHMVal=0;
        for(var j=0;j<data.rows.length;j++){
            if(typeof(hmIdx)!="undefined"){
                if(data.rows[j][hmIdx]>maxHMVal){
                    maxHMVal=data.rows[j][hmIdx];
                }
            }
        }

        //热力图数据单独取

        if($(rheatmapstyleID).is(':visible')){
            $(rmaptableID).empty();
            //深蓝 key1
            var hDeepBlue1='#0000FF';var valScope1="<="+maxHMVal/5.0;
            //浅蓝 key2
            var hLightBlue2='#2783e6';var valScope2="<="+maxHMVal*2.0/5.0+"and"+">"+maxHMVal/5.0;
            //绿 key3
            var hGreen3='#008000';var valScope3="<="+maxHMVal*3.0/5.0+"and"+">"+maxHMVal*2.0/5.0;
            //黄 key4
            var hYellow4='#FFFF00';var valScope4="<="+maxHMVal*4.0/5.0+"and"+">"+maxHMVal*3.0/5.0;
            //红色
            var hRed5='#FF0000';var valScope5="<="+maxHMVal+"and"+">"+maxHMVal*4.0/5.0;

            hmMap.set(hDeepBlue1,valScope1);
            hmMap.set(hLightBlue2,valScope2);
            hmMap.set(hGreen3,valScope3);
            hmMap.set(hYellow4,valScope4);
            hmMap.set(hRed5,valScope5);

            $(rmaptableID).append("<tr id='rhmtitle'><td>Heat Level</td><td>Heat Scope</td></tr>");
            hmMap.forEach(function (value, key, map) {
                var id=key;
                $(rmaptableID).append("<tr><td style='background-color:"+key+"'></td><td>"+value+"</td></tr>");
            });
        }

       // console.log("hmPoints:"+JSON.stringify(hmPoints));
        //画热力图
        var rheatmapyesID="#rheatmapyes"+this.targetEl.id;
        $(rheatmapyesID).click(function () {
            console.log("routeid 热力图按钮被点击...");
            if(typeof(routeidIdx)!="undefined"&&typeof(tipIdx)!="undefined") {
                //展示加载动画
                $(clockID).css("visibility","visible");
                $(clockID).css("overflow","visible");

                for(var i=0;i<data.rows.length;i++){
                    var hcolor=null;
                    if(data.rows[i][hmIdx]<(maxHMVal/5.0)){
                        //深蓝
                        hcolor='#0000FF';
                    }else if(data.rows[i][hmIdx]>(maxHMVal/5.0)&&data.rows[i][hmIdx]<(maxHMVal*2.0/5.0)){
                        //浅蓝
                        hcolor='#2783e6';
                    }else if(data.rows[i][hmIdx]>(maxHMVal*2.0/5.0)&&data.rows[i][hmIdx]<(maxHMVal*3.0/5.0)){
                        //绿
                        hcolor='#008000';
                    }else if(data.rows[i][hmIdx]>(maxHMVal*3.0/5.0)&&data.rows[i][hmIdx]<(maxHMVal*4.0/5.0)){
                        //黄
                        hcolor='#FFFF00';
                    }else if(data.rows[i][hmIdx]>(maxHMVal*4.0/5.0)){
                        //红色
                        hcolor='#FF0000';
                    }
                    //根据linkid网络请求获得数据
                    var routeID=data.rows[i][routeidIdx];//获得linkid
                    var title;
                    if(typeof(tipIdx)!="undefined"){
                        title=i+":"+data.rows[i][tipIdx].name+":"+data.rows[i][tipIdx];
                    }else{
                        title=i+":please set tip!";
                    }
                    var lineStyleObj=new Object();
                    lineStyleObj.strokeColor=hcolor;
                    lineStyleObj.strokeWeight=4;
                    queryRoute(routeID+"", lineStyleObj, title);
                }
                //关闭加载动画
                setTimeout(function(){
                    $(clockID).css("visibility","hidden");
                    $(clockID).css("overflow","hidden");
                },3000);
            }else{
                console.log("routeid Please bind the corresponding data!");
            }
        });
        var rheatmapnoID="#rheatmapno"+this.targetEl.id;
        $(rheatmapnoID).click(function () {
            clearHeatMap();
        });
//==================画热力图逻辑:end=================================================
    }

    initMapDiv(){
        console.log("routeid initMapDiv() called ...");
        //为了解决搜狗地图显示的bug添加的style
        var mapStyle=document.createElement('style');
        mapStyle.innerHTML="#rsogoumap"+this.targetEl.id+" img { max-width:none }";
        document.head.appendChild(mapStyle);

        //初始化搜狗地图
        var mapDiv=document.createElement('div');
        mapDiv.id="rsogoumap"+this.targetEl.id;
        mapDiv.style="position:relative;height:100%;width:50%;float:left;";
        //将搜狗地图的div添加到路线信息表的父节点中
        this.targetEl.parentNode.appendChild(mapDiv);
    }

    //初始化风格栏
    initStyeDiv(dom){
        console.log("routeid initStyeDiv() called ...");
        //初始化style
        var stypeStyle=document.createElement('style');
        stypeStyle.innerHTML="#rpopUp"+this.targetEl.id+"{\n" +
            "\t\t\tposition: absolute;\n" +
            "\t\t\tvisibility: hidden;\n" +
            "\t\t\toverflow: hidden;\n" +
            "\t\t\tbackground-color: white;\n" +
            "\t\t\tpadding:5px;\n" +
            "\t\t\tz-index: 99999;\n" +
            "\t\t\twidth:580px; height:340px; margin-top: 0px;\n" +
            "\t\t\tborder-color:black; border-width:4px\n" +
            "\t\t}\n" +
            "\t\t#rtableoutter"+this.targetEl.id+"{\n" +
            "\t\t\tposition:relative;  height:100%;  width:75%;  float:left;background-color: white;\n" +
            "\t\t\tborder-style:ridge;border-color:white; border-width:4px;text-align: center;\n" +
            "\t\t}\n" +
            "\t\t#rtableinner"+this.targetEl.id+"{\n" +
            "\t\t\tposition:relative;  height:95%;  width:95%;  float:left;background-color: rgba(0,255,0,0.2);\n" +
            "\t\t\tmargin-top: 2%;margin-left: 2%;  overflow-y: scroll;\n" +
            "\t\t}\n" +
            "\t\t#rmaptable"+this.targetEl.id+"{\n" +
            "\t\t\tposition:relative;  height:90%;  width:95%;  float:left;background-color:white;\n" +
            "\t\t\tmargin-top: 4%;margin-left: 2%;\n" +
            "\t\t}\n" +
            "\n" +
            "\t\t#routeidtypestyle"+this.targetEl.id+"{\n" +
            "\t\t\tposition:relative;  height:100%;  width:20%;  float:left;text-align: center;border-style:ridge;\n" +
            "\t\t\tborder-color:#c0c0c0; border-width:4px;\n" +
            "\t\t}\n" +
            "\t\t.divtitle{\n" +
            "\t\t\tposition:relative;  height:8%;  width:100%; margin-top:4px; text-align: center;font-weight:bold;\n" +
            "\t\t}\n" +
            "\t\t.typetitle{\n" +
            "\t\t\tposition:relative;  height:5%;  width:100%; margin-top:4px; text-align: center;font-weight:bold;\n" +
            "\t\t}\n" +
            "\t\t.routeiddivstyle{\n" +
            "\t\t\tdisplay:none; position: relative;  height: 60%; width:98%; text-align: center;background-color: rgba(0,255,0,0.2);\n" +
            "\t\t}\n" +
            "\t\t.rylColor {\n" +
            "\t\t\tposition: absolute;\n" +
            "\t\t\tz-index: 99999;\n" +
            "\t\t\twidth: 250px;\n" +
            "\t\t\tbackground: #fff;\n" +
            "\t\t\tbox-shadow: 1px 1px 2px #c6d9f1, -1px -1px 2px #c6d9f1;\n" +
            "\t\t\tfont-size: 14px;\n" +
            "\t\t\tcolor: #000;\n" +
            "\t\t}\n" +
            "\t\t.rylColor .raCol {\n" +
            "\t\t\tdisplay: inline-block;\n" +
            "\t\t\tfloat: left;\n" +
            "\t\t\twidth: 15px;\n" +
            "\t\t\theight: 15px;\n" +
            "\t\t\tmargin: 0 7px 7px 0;\n" +
            "\t\t\tborder: 1px solid #eee;\n" +
            "\t\t\tcursor: pointer;\n" +
            "\t\t}\n" +
            "\t\t.rylColor .raCol:nth-child(10n) {\n" +
            "\t\t\tmargin-right: 0;\n" +
            "\t\t}\n" +
            "\t\t.rylColor-default {\n" +
            "\t\t\tpadding: 7px;\n" +
            "\t\t}\n" +
            "\t\t.rylColor-custom ul {\n" +
            "\t\t\toverflow: hidden;\n" +
            "\t\t\tpadding: 7px 7px 0;\n" +
            "\t\t}\n" +
            "\t\t.rylColor .rtitle {\n" +
            "\t\t\tpadding: 7px;\n" +
            "\t\t\tbackground-color: #f4f4f8;\n" +
            "\t\t}";
        document.head.appendChild(stypeStyle);

        //初始化div
        var styeDiv = document.createElement('div');
        styeDiv.id = "rpopUp"+this.targetEl.id;
        styeDiv.innerHTML="<div id=\"routeidtypestyle"+this.targetEl.id+"\" >\n" +
            "\t\t<span class=\"divtitle\" size=\"30px\">STYE</span><hr />\n" +
            "\t\t<div id=\"rlinestyle"+this.targetEl.id+"\" class=\"routeiddivstyle\">\n" +
            "\t\t\t<span class=\"typetitle\" size=\"18px\">LineStyle</span><br/>\n" +
            "\t\t\t<button id=\"rlineyes"+this.targetEl.id+"\" style=\"position:relative;margin-top:30px;width:80%\">Draw</button><br/>\n" +
            "\t\t\t<button id=\"rlineno"+this.targetEl.id+"\" style=\"position:relative;margin-top:30px;width:80%\">Clear</button>\n" +
            "\t\t</div>\n" +
            "\t\t<div id=\"rheatmapstyle"+this.targetEl.id+"\" class=\"routeiddivstyle\">\n" +
            "\t\t\t<span class=\"typetitle\" size=\"18px\">HeatMap Style</span><br/>\n" +
            "\t\t\t<button id=\"rheatmapyes"+this.targetEl.id+"\" style=\"position:relative;margin-top:30px;width:80%;\">Draw</button>\n" +
            "\t\t\t<button id=\"rheatmapno"+this.targetEl.id+"\" style=\"position:relative;margin-top:30px;width:80%;\">Clear</button>\n" +
            "\t\t</div>\n" +
            "\t\t<button id=\"rhidePopup"+this.targetEl.id+"\" style=\"position:relative;width:60%;margin-top: 30px;\">Close</button>\n" +
            "\t</div>\n" +
            "\t<div id=\"rtableoutter"+this.targetEl.id+"\" >\n" +
            "\t\t<div id=\"rtableinner"+this.targetEl.id+"\">\n" +
            "\t\t\t<table id=\"rmaptable"+this.targetEl.id+"\" border=\"1\">\n" +
            "\t\t\t</table>\n" +
            "\t\t</div>\n" +
            "\t</div>";
        this.targetEl.parentNode.appendChild(styeDiv);

        this.setStyeClick();
    }

    //初始化上面工具栏
    initToolDiv() {
        console.log("routeid initToolDiv()方法被调用，初始化工具栏...");

        var toolStyle = document.createElement('style');
        toolStyle.innerHTML = "#rtool"+this.targetEl.id+"{\n" +
            "\t\t\t  position:relative;  height:100%;  width:10%;  float:left;text-align: center;border-style:ridge;\n" +
            "\t\t\t  border-color:#c0c0c0; border-width:4px;\n" +
            "\t\t  }\n" +
            "\t\t  .tooldivfirst{\n" +
            "\t\t\t  position:relative;  height:12%;  width:98%;margin-top: 10px;\n" +
            "\t\t  }\n" +
            "\t\t  .tooldivother {\n" +
            "\t\t\t  position: relative;  height: 12%; width:98%;   text-align: center;\n" +
            "\t\t  }\n" +
            "\t\t  .tooldivlast {\n" +
            "\t\t\t  position: relative;  height: 10%;  width:98%; float: left;\n" +
            "\t\t  }\n" +
            "\t\t  .tooltitle{\n" +
            "\t\t\t  position:relative;  height:5%;  width:100%; margin-top:4px; text-align: center;font-weight:bold;\n" +
            "\t\t  }\n" +
            "\t\t  .toolbu{\n" +
            "\t\t\t  position:relative;  height:80%;  width:98%;\n" +
            "\t\t  }\n" +
            "\t\t  .budiv{\n" +
            "\t\t\t  display:none; position:relative;  width:98%;  margin-left:4px;text-align: center; background-color: rgba(0,255,0,0.2);\n" +
            "\t\t  }\n" +
            "\t\t  .divinput{\n" +
            "\t\t\t  position:relative;width:80%;margin-top:4px;margin:auto;\n" +
            "\t\t  }";
        document.head.appendChild(toolStyle);

        //初始化右侧工具栏div
        var toolDiv = document.createElement('div');
        toolDiv.id = "rtool"+this.targetEl.id;
        toolDiv.innerHTML = "<span size=\"18px\" class=\"tooltitle\">Tools</span>\n" +
            "\t\t<div id=\"rdiv1"+this.targetEl.id+"\" class=\"tooldivfirst\" >\n" +
            "\t\t  <button id=\"rdrawpoint"+this.targetEl.id+"\" class=\"toolbu\" >DrawPoint</button>\n" +
            "\t\t  <div id=\"rdrawpointdiv"+this.targetEl.id+"\" class=\"budiv\">\n" +
            "\t\t\t<span >Ponits(x1,y1,x2,y2,...):</span>\n" +
            "\t\t\t<input id=\"rpoint"+this.targetEl.id+"\" class=\"divinput\" style=\"\"/><br/>\n" +
            "\t\t\t  Icon:<select id=\"rtoolpointicon"+this.targetEl.id+"\" style=\"position:relative;width:80%;margin-top:4px\">\n" +
            "\t\t\t  <option value=\"../../../../image/ball-green-16.png\">ball</option>\n" +
            "\t\t\t  <option value=\"../../../../image/ping.png\">pin</option>\n" +
            "\t\t\t  <option value=\"../../../../image/flag_red.png\">flag</option>\n" +
            "\t\t\t  <option value=\"../../../../image/point.png\">point</option>\n" +
            "\t\t\t  <option value=\"../../../../image/S20.png\">S20</option>\n" +
            "\t\t  </select><br/>\n" +
            "\t\t\t<span id=\"rcheckdrawpoint"+this.targetEl.id+"\" style=\"display:none;position:relative;color:red\"></span><br/>\n" +
            "\t\t\t<button id=\"rdrawpointsure"+this.targetEl.id+"\" style=\"position:relative;margin-top:0px;width:45%;margin-bottom:10px;\">Draw</button>\n" +
            "\t\t\t<button id=\"rclearpoint"+this.targetEl.id+"\" style=\"position:relative;margin-top:0px;width:45%;margin-bottom:10px;\">Clear</button>\n" +
            "\t\t  </div>\n" +
            "\t    </div >\n" +
            "\t    <div id=\"rdiv2"+this.targetEl.id+"\" class=\"tooldivother\">\n" +
            "\t\t  <button id=\"rdrawlink"+this.targetEl.id+"\" class=\"toolbu\">DrawLink</button>\n" +
            "\t\t  <div id=\"rdrawlinkdiv"+this.targetEl.id+"\" class=\"budiv\">\n" +
            "\t\t\t  <span >Line(x1,y1,x2,y2,...):</span><br/>\n" +
            "\t\t\t  <input id=\"rline"+this.targetEl.id+"\" style=\"position:relative;width:80%;margin-top:4px\"/><br/>\n" +
            "\t\t\t  LineColor:<select id=\"rlinecolor"+this.targetEl.id+"\" style=\"position:relative;width:80%;margin-top:4px;\">\n" +
            "\t\t\t\t\t\t<option value='red'>red</option>\n" +
            "\t\t\t\t\t\t<option value='blue'>blue</option>\n" +
            "\t\t\t\t\t\t<option value='green'>green</option>\n" +
            "\t\t\t  </select><br/>\n" +
            "\t\t\t  LineWeight:<select id=\"rlineweight"+this.targetEl.id+"\" style=\"position:relative;width:80%;margin-top:4px;\">\n" +
            "\t\t\t\t  <option value=1 >1</option>\n" +
            "\t\t\t\t  <option value=4 >4</option>\n" +
            "\t\t\t\t  <option value=8 >8</option>\n" +
            "\t\t\t  </select><br/>\n" +
            "\t\t\t<span id=\"rcheckdrawline"+this.targetEl.id+"\" style=\"display:none;position:relative;color:red\"></span><br/>\n" +
            "\t\t\t<button id=\"rdrawlinesure"+this.targetEl.id+"\" style=\"position:relative;margin-top:4px;margin-bottom:10px;width:45%\">Draw</button>\n" +
            "\t\t\t<button id=\"rclearline"+this.targetEl.id+"\" style=\"position:relative;margin-top:4px;margin-bottom:10px;width:45%\">Clear</button>\n" +
            "\t\t  </div>\n" +
            "\t    </div>\n" +
            "\t    <div id=\"rdiv3"+this.targetEl.id+"\" class=\"tooldivother\">\n" +
            "\t\t    <button id=\"rdrawgeo"+this.targetEl.id+"\" class=\"toolbu\">DrawGeo</button>\n" +
            "\t\t    <div id=\"rdrawgeodiv"+this.targetEl.id+"\" class=\"budiv\">\n" +
            "\t\t\t\t<span >Geo(x1,y1,x2,y2,...):</span><br/>\n" +
            "\t\t\t\t<input id=\"rgeo"+this.targetEl.id+"\" style=\"position:relative;width:80%;margin-top:4px\"/><br/>\n" +
            "\t\t\t\tStrokeColor: <select id=\"rgeocolor"+this.targetEl.id+"\" style=\"position:relative;width:80%;margin-top:4px;\">\n" +
            "\t\t\t\t\t<option value='red'>red</option>\n" +
            "\t\t\t\t\t<option value='blue'>blue</option>\n" +
            "\t\t\t\t\t<option value='green'>green</option>\n" +
            "\t\t\t\t</select><br/>\n" +
            "\t\t\t\tStrokeOpacity: <select id=\"rgeoopacity"+this.targetEl.id+"\" style=\"position:relative;width:80%;margin-top:4px;\">\n" +
            "\t\t\t\t\t<option value=0.1>0.1</option>\n" +
            "\t\t\t\t\t<option value=0.2>0.2</option>\n" +
            "\t\t\t\t    <option value=0.3>0.3</option>\n" +
            "\t\t\t\t\t<option value=0.4>0.4</option>\n" +
            "\t\t\t\t\t<option value=0.5>0.5</option>\n" +
            "\t\t\t\t\t<option value=0.6>0.6</option>\n" +
            "\t\t\t\t\t<option value=0.7>0.7</option>\n" +
            "\t\t\t\t\t<option value=0.8>0.8</option>\n" +
            "\t\t\t\t\t<option value=0.9>0.9</option>\n" +
            "\t\t\t\t\t<option value=1.0>1.0</option>\n" +
            "\t\t\t\t</select><br/>\n" +
            "\t\t\t\tstrokeWeight: <select id=\"rgeoweight"+this.targetEl.id+"\" style=\"position:relative;width:80%;margin-top:4px;\">\n" +
            "\t\t\t\t\t<option value=1>1</option>\n" +
            "\t\t\t\t\t<option value=5>5</option>\n" +
            "\t\t\t\t\t<option value=10>10</option>\n" +
            "\t\t\t\t</select><br/>\n" +
            "\t\t\t\t<span id=\"rcheckdrawgeo"+this.targetEl.id+"\" style=\"display:none;position:relative;color:red\"></span><br/>\n" +
            "\t\t\t\t<button id=\"rdrawgeosure"+this.targetEl.id+"\" style=\"position:relative;margin-top:4px;width:45%;margin-bottom:10px;\">Draw</button>\n" +
            "\t\t\t\t<button id=\"rcleargeo"+this.targetEl.id+"\" style=\"position:relative;margin-top:4px;width:45%;margin-bottom:10px;\">Clear</button>\n" +
            "\t\t\t</div>\n" +
            "\t    </div>\n" +
            "\t    <div  id=\"rdiv6"+this.targetEl.id+"\"class=\"tooldivlast\">\n" +
            "\t\t\t<button id=\"rshowPopup"+this.targetEl.id+"\" style=\"position:relative;width:80%;margin-top: 10px\">Draw</button>\n" +
            "\t    </div>";
        this.targetEl.parentNode.appendChild(toolDiv);

        this.setToolClick();
    }

    initLayout(){
        var styeID="#rpopUp"+this.targetEl.id;
        var mapID="#rsogoumap"+this.targetEl.id;
        var toolID="#rtool"+this.targetEl.id;

        if(!$(styeID)[0]){
            this.initStyeDiv();
        }
        if(!$(mapID)[0]){
            this.initMapDiv();//创建地图的div
        }
        if(!$(toolID)[0]){
            this.initToolDiv();
        }

        var clockID="#rclock"+this.targetEl.id;
        if(!$(clockID)[0]) {
            this.initTimeClock();
        }

        if($(mapID)[0]){
            console.log("routeid 显示sogoumap div...");
            $(mapID).show();
        }
        if($(toolID)[0]){
            $(toolID).show();
            console.log("routeid 显示tool div...");
        }
        var sogouMapID="rsogoumap"+this.targetEl.id;
        if((typeof(rsogouMap)=="undefined"&&($("#go2map")[0]))||(rsogouMap==null&&($("#go2map")[0]))){
            console.log("routeid activate initsogoumap()...");
            rsogouMap=initSogouMap(sogouMapID);//激活的时候也初始化地图
        }
    }

    destroyLayout(){
        var styeID="#rpopUp"+this.targetEl.id;
        var mapID="#rsogoumap"+this.targetEl.id;
        var toolID="#rtool"+this.targetEl.id;
        //清空表div的子元素
        var tableID="#"+this.targetEl.id;
        $(tableID).empty();
        if($(mapID)[0]){
            console.log("routeid 隐藏sogoumap div...");
            $(mapID).hide();
        }
        if($(toolID)[0]){
            $(toolID).hide();
            console.log("routeid 隐藏tool div...");
        }

        $(styeID).css("visibility","hidden");
        $(styeID).css("overflow","hidden");


        $(styeID).remove();
        $(mapID).remove();
        $(toolID).remove();
        var clockID="#rclock"+this.targetEl.id;
        $(clockID).remove();

        rsogouMap=null;
        //rmyagGrid=null;

    }

    setStyeClick(){
        var styeID="#rpopUp"+this.targetEl.id;
        var rhidePopupID="#rhidePopup"+this.targetEl.id;
        $(rhidePopupID).click(function(){
            $(styeID).css("visibility","hidden");
            $(styeID).css("overflow","hidden");
        });
    }

    setToolClick(){
        var styeID="#rpopUp"+this.targetEl.id;
        var rshowPopupID="#rshowPopup"+this.targetEl.id;
        $(rshowPopupID).click(function(){
            $(styeID).css("position","absolute");
            $(styeID).css("visibility","visible");
            $(styeID).css("overflow","visible");
            $(styeID).css("background-color","white");
            $(styeID).css("padding","5px");
            $(styeID).css("z-index","99999");

            $(styeID).css("width","580px");
            $(styeID).css("height","340px");
            $(styeID).css("margin-top","0px");
            $(styeID).css("border-color","black");
            $(styeID).css("border-width","4px");
        });

        //==============工具栏点击逻辑：start=================================================
        var rdrawpointID="#rdrawpoint"+this.targetEl.id;
        var rdrawpointdivID="#rdrawpointdiv"+this.targetEl.id;
        var rdiv1ID="#rdiv1"+this.targetEl.id;
        var rdiv2ID="#rdiv2"+this.targetEl.id;
        var rdiv3ID="#rdiv3"+this.targetEl.id;
        var rdiv4ID="#rdiv4"+this.targetEl.id;
        var rdiv5ID="#rdiv5"+this.targetEl.id;
        var rdiv6ID="#rdiv6"+this.targetEl.id;
        $(rdrawpointID).click(function () {
            $(rdrawpointdivID).toggle();
            $(rdiv2ID).toggle();
            $(rdiv3ID).toggle();
            $(rdiv4ID).toggle();
            $(rdiv5ID).toggle();
            $(rdiv6ID).toggle();
            $(rshowPopupID).toggle();
        });
        var rdrawlinkID="#rdrawlink"+this.targetEl.id;
        var rdrawlinkdivID="#rdrawlinkdiv"+this.targetEl.id;
        $(rdrawlinkID).click(function () {
            $(rdrawlinkdivID).toggle();
            $(rdiv1ID).toggle();
            $(rdiv3ID).toggle();
            $(rdiv4ID).toggle();
            $(rdiv5ID).toggle();
            $(rdiv6ID).toggle();
            $(rshowPopupID).toggle();
        });
        var rdrawgeoID="#rdrawgeo"+this.targetEl.id;
        var rdrawgeodivID="#rdrawgeodiv"+this.targetEl.id;
        $(rdrawgeoID).click(function () {
            $(rdrawgeodivID).toggle();
            $(rdiv1ID).toggle();
            $(rdiv2ID).toggle();
            $(rdiv4ID).toggle();
            $(rdiv5ID).toggle();
            $(rdiv6ID).toggle();
            $(rshowPopupID).toggle();
        });
//==============工具栏点击逻辑：end=================================================

//==============画点、画线：start======================================================
        var rdrawpointsureID="#rdrawpointsure"+this.targetEl.id;
        var rpointID="#rpoint"+this.targetEl.id;
        var rcheckdrawpointID="#rcheckdrawpoint"+this.targetEl.id;
        var rtoolpointiconID="#rtoolpointicon"+this.targetEl.id;
        $(rdrawpointsureID).click(function () {
            if (!$(rpointID).val()) {
                $(rcheckdrawpointID).show();
                $(rcheckdrawpointID).text("*Please set the values of X and Y!");
            } else {
                $(rcheckdrawpointID).hide();
                drawMarkers($(rpointID).val(),$(rtoolpointiconID).val(),"");
            }
        });
        var rclearpointID="#rclearpoint"+this.targetEl.id;
        $(rclearpointID).click(function () {
            rsogouMap.clearAll();
        });

        //画线
        var rdrawlinesureID="#rdrawlinesure"+this.targetEl.id;
        var rlineID="#rline"+this.targetEl.id;
        var rcheckdrawlineID="#rcheckdrawline"+this.targetEl.id;
        var rlinecolorID="#rlinecolor"+this.targetEl.id;
        var rlineweightID="#rlineweight"+this.targetEl.id;
        $(rdrawlinesureID).click(function () {
            if (!$(rlineID).val()) {
                $(rcheckdrawlineID).show();
                $(rcheckdrawlineID).text("*Please enter the correct link coordinate value!");
            } else {
                $(rcheckdrawlineID).hide();
                var polyOptions = {
                    strokeColor: $(rlinecolorID).val(), /*'#FF4500'*/
                    strokeOpacity: 1.0,
                    strokeWeight: $(rlineweightID).val()
                }
                drawLine($(rlineID).val(), polyOptions);
            }
        });
        var rclearlineID="#rclearline"+this.targetEl.id;
        $(rclearlineID).click(function () {
            rsogouMap.clearAll();
        });
//==============画点、画线：end======================================================

//==============画geo：start======================================================
        var rdrawgeosureID="#rdrawgeosure"+this.targetEl.id;
        var rgeoID="#rgeo"+this.targetEl.id;
        var rcheckdrawgeoID="#rcheckdrawgeo"+this.targetEl.id;
        var rgeocolorID="#rgeocolor"+this.targetEl.id;
        var rgeoopacityID="#rgeoopacity"+this.targetEl.id;
        var rgeoweightID="#rgeoweight"+this.targetEl.id;
        $(rdrawgeosureID).click(function () {
            if (!$(rgeoID).val()) {
                $(rcheckdrawgeoID).show();
                $(rcheckdrawgeoID).text("*Please enter the correct geo coordinate value!");
            } else {
                $(rcheckdrawgeoID).hide();
                drawBound($(rgeoID).val(),"", $(rgeocolorID).val(), $(rgeoopacityID).val(), $(rgeoweightID).val());
            }
        });
        var rcleargeoID="#rcleargeo"+this.targetEl.id;
        $(rcleargeoID).click(function () {
            rsogouMap.clearAll();
        });
//==============画geo：end======================================================
    }

    initTimeClock(){
        var clockStyle=document.createElement('style');
        clockStyle.innerHTML="*{margin:0;padding:0;}\n" +
            "\n" +
            ".m-load,.m-load2{width:100px;height:100px;margin:0px auto 0;}\n" +
            ".m-load2{background:green;}\n" +
            "\n" +
            "/** 加载动画的静态样式 **/\n" +
            ".m-load2{position:relative;}\n" +
            ".m-load2 .item{position:absolute;left:50%;top:0;width:14px;height:100%;margin-left:-7px;}\n" +
            ".m-load2 .item:before,.m-load2 .item:after{content:'';display:block;width:14px;height:14px;border-radius:14px;background:#fff;}\n" +
            ".m-load2 .item:after{position:absolute;bottom:0;}\n" +
            ".m-load2 .item:nth-child(2){-webkit-transform:rotate(45deg);}\n" +
            ".m-load2 .item:nth-child(3){-webkit-transform:rotate(90deg);}\n" +
            ".m-load2 .item:nth-child(4){-webkit-transform:rotate(135deg);}\n" +
            "\n" +
            "/** 加载动画 **/\n" +
            "@-webkit-keyframes load{\n" +
            "    0%{opacity:0;}\n" +
            "    100%{opacity:1;}\n" +
            "}\n" +
            ".m-load2 .item:nth-child(1):before{-webkit-animation:load 0.8s linear 0.7s infinite;}\n" +
            ".m-load2 .item:nth-child(2):before{-webkit-animation:load 0.8s linear 0.6s infinite;}\n" +
            ".m-load2 .item:nth-child(3):before{-webkit-animation:load 0.8s linear 0.5s infinite;}\n" +
            ".m-load2 .item:nth-child(4):before{-webkit-animation:load 0.8s linear 0.4s infinite;}\n" +
            ".m-load2 .item:nth-child(1):after{-webkit-animation:load 0.8s linear 0.3s infinite;}\n" +
            ".m-load2 .item:nth-child(2):after{-webkit-animation:load 0.8s linear 0.2s infinite;}\n" +
            ".m-load2 .item:nth-child(3):after{-webkit-animation:load 0.8s linear 0.1s infinite;}\n" +
            ".m-load2 .item:nth-child(4):after{-webkit-animation:load 0.8s linear 0s infinite;}";
        document.head.appendChild(clockStyle);

        var clockDiv = document.createElement('div');
        clockDiv.id = "rclock"+this.targetEl.id;
        clockDiv.style="position: absolute;\n" +
            "\t\t\tvisibility: hidden;\n" +
            "\t\t\toverflow: hidden;\n" +
            "\t\t\tbackground-color: rgba(0,0,0,0);\n" +
            "\t\t\tpadding:5px;\n" +
            "\t\t\tz-index: 99999;\n" +
            "\t\t\twidth:100px; height:100px; margin-top: 0px;margin-left: 700px;";
        clockDiv.innerHTML ="<div class=\"m-load\"></div>\n" +
            "<div class=\"m-load2\">\n" +
            "    <div class=\"item\"></div>\n" +
            "    <div class=\"item\"></div>\n" +
            "    <div class=\"item\"></div>\n" +
            "    <div class=\"item\"></div>\n" +
            "</div>";
        this.targetEl.parentNode.appendChild(clockDiv);

    }

}

//========搜狗地图画图相关变量（如图的颜色等）：start=====================================
var rsogouMap;
var colors = ["#00FFFF", "#0000FF", "#00FF00", "#8A2BE2",  "#FFFF00", "#A52A2A", "#FF0000", "#DEB887", "#8B0000", "#5F9EA0","#D2691E","#6495ED","#008B8B","#B8860B","#006400"];
var mapGeomArray = new Array();
var heatmapInstance;
//========搜狗地图画图相关变量（如图的颜色等）：end=====================================

function mySetCenter(x,y){
    var point = new window.sogou.maps.Point(Number(x),Number(y));
    rsogouMap.setCenter(point);
}

//========初始化地图要用的参数:start====================================================

function setGeomVisible(index, visible){
    if(visible)
        mapGeomArray[index].show();
    else
        mapGeomArray[index].hide();
}


//========初始化地图要用的参数:end====================================================

//========初始化搜狗地图:start==========================================================
function initSogouMap(sogouMapID){
    // if(robj.InitFlag){
    //     robj.InitFlag=false;
        console.log("routeid initSogouMap() called...");
        var myLatlng = new window.sogou.maps.LatLng(39.992792, 116.326142);
        var myOptions = {
            zoom: 9,
            center: myLatlng,
            mapTypeId: window.sogou.maps.MapTypeId.ROADMAP
        }
        return new window.sogou.maps.Map(document.getElementById(sogouMapID), myOptions);
    //}
}
//搜狗地图上画点
function drawPoint(point){
    var icon = '../../../../image/pin.png';//这里图片目录需要修改
    console.log("routeid 画点函数中的图标为："+icon+"=="+JSON.stringify(icon)+"此时的sogouMap对象："+rsogouMap);
    if(typeof(point.style) != "undefined" && typeof(point.style.icon) != "undefined")
        icon = "../image/" + point.style.icon;

    var strs = point.geom.split(",");
    var p = new window.sogou.maps.Point(Number(strs[0]),Number(strs[1]));

    if(p.x == 0 || isNaN(p.x) || p.y == 0 || isNaN(p.y))
        return;

    return new window.sogou.maps.Marker({
        position: p,
        title: point.info,
        icon: icon,
        map: rsogouMap,
    });
}
//搜狗地图上画线
function drawLink(link)
{
    var color = colors[0];
    if(typeof(link.style) != "undefined" && typeof(link.style.color) != "undefined")
        color = link.style.color;

    var path = new Array();
    var strs = link.geom.split(",");
    for(var j = 0; j < strs.length; j = j + 2){
        var point = new window.sogou.maps.Point(Number(strs[j]),Number(strs[j + 1]));

        if(point.x == 0 || isNaN(point.x) || point.y == 0 || isNaN(point.y))
            continue;

        path.push(point);
    }

    return new window.sogou.maps.Polyline({
        path: path,
        strokeColor: color,
        title: link.info,
        map: rsogouMap
    });
}
function refreshMapByTable(){

    $('#table input[type="checkbox"]').each(function(i){
        var id = $(this).prop('id').toString();
        var checked = $(this).prop('checked');
        var idTag = id.substr(0, 5);
        if(idTag == 'check'){
            var idIndex = parseInt(id.substr(5));
            setGeomVisible(idIndex, $(this).prop('checked'));
        }
    })
}
//========初始化搜狗地图:end==========================================================

//==================工具栏相关函数：start==========================================
//画点
function drawMarkers(lonlats,pointicon,geoInfo){
    var strs= new Array();
    strs = lonlats.split(",");
    var point;
    for(var i = 0; i < strs.length; i = i + 2){
        point = new window.sogou.maps.Point(Number(strs[i]),Number(strs[i + 1]));

        var marker = new window.sogou.maps.Marker({
            position: point,
            title: geoInfo,
            map: rsogouMap,
            icon: pointicon        /*'../../../../image/S20.png'*/
        });
    }
    rsogouMap.setCenter(point);
}
//画线
function drawLine(lonlats,styleOptions,geoInfo){
    var polyOptions = {
        strokeColor: styleOptions.strokeColor, /*'#FF4500'*/
        strokeOpacity: 1.0,
        strokeWeight: styleOptions.strokeWeight,
        title:geoInfo
    }
    var poly = new window.sogou.maps.Polyline(polyOptions);
    poly.setMap(rsogouMap);

    var strs= new Array();
    strs = lonlats.split(",");
    var point;
    for(var i = 0; i < strs.length; i = i + 2){
        point = new window.sogou.maps.Point(Number(strs[i]),Number(strs[i + 1]));
        var path = poly.getPath()||[];
        path.push(point);
        poly.setPath(path);
    }
    rsogouMap.setCenter(point);
}
//画geo
function drawBound(lonlats,geoInfo,geocolor,geoopacity,geoweight){
    var strs = lonlats.split(",");
    var points = new Array();

    for(var i = 0; i < strs.length; i = i + 2){
        points[i / 2] = new window.sogou.maps.Point(Number(strs[i]),Number(strs[i + 1]));
    }

    var bermudaTriangle = new window.sogou.maps.Polygon({
        path: points,
    });

    var bound = bermudaTriangle.getBounds()
    var paths = [
        new window.sogou.maps.Point(bound.minX, bound.minY),
        new window.sogou.maps.Point(bound.minX, bound.maxY),
        new window.sogou.maps.Point(bound.maxX, bound.maxY),
        new window.sogou.maps.Point(bound.maxX, bound.minY),
        new window.sogou.maps.Point(bound.minX, bound.minY),
    ]

    var flightPath = new window.sogou.maps.Polyline({
        path: paths,
        strokeColor: geocolor,
        strokeOpacity: geoopacity,
        strokeWeight: geoweight,
        title:geoInfo,
        map: rsogouMap
    });

    rsogouMap.setCenter(bound.getCenter());
}
//==================工具栏相关函数：end==========================================

//==================通过linkID画图相关:start=====================================
var server = "link的服务器地址";

//增加一个参数 将画link的选项都添加到linkStyleObj
//needChangeColor:true
//needDrawPoint:true
//showTraffic:false
//index:0
function drawLinks(data, showTraffic, index, linkStyleObj,title){
    var startPoint=null;
    $.each(data.links,function(i,link){
        var linkInfo=null;
        if(title!=undefined&&title!=null&&title.length!=0){
            linkInfo=title;
        }else{
            linkInfo="indexID:"+link.indexID + " navID:"+link.linkID + " dir:" +link.dir + " sid: " + link.sid + " eid: " + link.eid + " type:" +link.linkType + " class:" +link.linkClass + " length:" +link.length + " name:" +link.linkName + " limit:" +link.speedLimit;
        }

        if(link.jamLevel != undefined && link.trafficSpeed != undefined)
        {
            linkInfo = linkInfo + " traffic:" +link.jamLevel +" speed: "+link.trafficSpeed;
        }

        var lonlats = link.line;
        var strs= new Array();
        strs = lonlats.split(",");
        var path = new Array();
        for(var j = 0; j < strs.length; j = j + 2){
            if(j==0){
                startPoint=new window.sogou.maps.Point(Number(strs[j]),Number(strs[j + 1]));
                path.push(startPoint);
            }else{
                path.push(new window.sogou.maps.Point(Number(strs[j]),Number(strs[j + 1])));
            }
        }

        index = (showTraffic && link.jamLevel !== undefined) ? (link.jamLevel * 2) : index;

        var line = new window.sogou.maps.Polyline({
            path: path,
            strokeColor: linkStyleObj.strokeColor,
            strokeOpacity: 1.0,
            strokeWeight: linkStyleObj.strokeWeight,
            title:linkInfo,
            map:rsogouMap
        });

        //给每个link设置点击侦听事件
        window.sogou.maps.event.addListener(line, 'click', function() {
            var t=line.getTitle();
            var index=Number(t.split(":")[0]);
            //测试使用
            robj.gridOptions.api.ensureIndexVisible(index,'top');
            robj.gridOptions.api.selectIndex(index,null,null);
        });

    });
    rsogouMap.setCenter(startPoint);
}
//==================通过linkID画图相关:end=======================================

//==================通过routeID画图相关:start========================================
//"",   "",  "",  routeID,     "",  false,      false,    false,       false,
function queryRoute(routeID, linkStyleObj, title){

    if(routeID != ""){
        var url = server + "/debug/route?routeid=" + routeID +"&callback=?";
        $.getJSON(url,function(data){
            drawLinks(data, false, 0, linkStyleObj, title);
            //drawLinks(data, false, 0, linkStyleObj,title);
        });
    }

}
//==================通过routeID画图相关:end==========================================