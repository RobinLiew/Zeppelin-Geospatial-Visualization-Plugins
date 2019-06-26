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
//=======颜色选择器方法===========================================================
$.fn.gSelectColor = function(options){
        var defaults = {
            containerId: 'gylColor',
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
            $('#' + settings.containerId).find('.gaCol').click(function(){
                onSelect(this);
            });
        };
        var build = function(){
            var containerId = settings.containerId;
            var containerDiv = $('<div id="'+ containerId+'" class="gylColor" style="display: none"></div>');
            var defaultDiv = $('<div class="gylColor-default"></div>');
            var customDiv = $('<div class="gylColor-custom"></div>');
            var formatDiv = $('<div class="gylColor-format"></div>');

            defaultDiv.append('<span class="gaCol" style="background-color: '+ settings.defaultColor +'" title="'+settings.defaultColor +'"></span>自动');
            var liHtml = '';
            $.each(settings.customColor,function(i,e){
                liHtml += '<li class="gaCol" data-color="'+e+'" style="background-color: '+ e +'" title="'+ e +'"></li>';
            });
            customDiv.append('<div class="gtitle">主题颜色</div><ul>'+liHtml+'</ul>');

            liHtml = '';
            $.each(settings.formatColor,function(i,e){
                liHtml += '<li class="gaCol" data-color="'+e+'" style="background-color: '+e+'" title="'+ e +'"></li>';
            });
            customDiv.append('<div class="gtitle">标准色</div><ul>'+liHtml+'</ul>');

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
var gobj=new Object();
export default class GSogouMapTable extends Visualization {
    constructor(targetEl, config) {
        super(targetEl, config);
        console.log('geom start constructor called...');
        /*选择器相关*/
        const columnSpec = [
            { name: 'CoordinatesX'},
            { name: 'CoordinatesY'},
            { name: 'Kind'},
            { name: 'HeatMapVal'},
            { name: 'MapTip'}
        ];
        this.transformation = new ColumnselectorTransformation(config, columnSpec);//tab栏设

        //改造表格的功能选项
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
        gobj.config = this.transformation.config;
        //为表格设置点击事件
        //为表格设置点击事件
        this.gridOptions.onRowClicked=function(ev){//onRowDoubleClicked
            //遍历对象的属性
            if(/^\d+$/.test(ev.data[gobj.config["CoordinatesX"].name]) && /^\d+$/.test(ev.data[gobj.config["CoordinatesY"].name])){
                var xs=(ev.data[gobj.config["CoordinatesX"].name]+"").split(",");
                var ys=(ev.data[gobj.config["CoordinatesY"].name]+"").split(",");
                mySetCenter(xs[0],ys[0]);
                //构造数据
                var str="";
                for(var i=0;i<xs.length;i++){
                    if(i==xs.length-1){
                        str=xs[i]+","+ys[i];
                    }else{
                        str=xs[i]+","+ys[i]+",";
                    }
                }
                //点击同时将图形标识出来
                if(xs.length==1){//点
                    var pointicon="../../../../image/ball-green-16.png";//默认值
                    drawMarkers(str, pointicon ,"");
                }else if(xs.length>1) {//线
                    var polyOptions = {
                        strokeColor: "black", /*'#FF4500'*/
                        strokeOpacity: 1.0,
                        strokeWeight: 8,
                        title: "",
                        map: gsogouMap
                    }
                    drawLine(str, polyOptions);
                }else{
                    alert("The data of X column in the table exists error!");
                }
            }else{
                alert("please set number to draw maps!")
            }
            console.log("geom 表格行被单击了...");
        };
        this.passthrough = new PassthroughTransformation(config);
        this.targetEl = targetEl[0];
        //修改表的布局
        this.targetEl.style="position:relative;height:100%;width:40%;float:left";
        this.targetEl.classList.add('ag-fresh');

        //this.gridOptions.api.exportDataAsCsv(params);

        this.destroyLayout();

        console.log('geom end constructor called...'+'targetEl:');
    };

    //加载搜狗地图第三方api库
    loadapi(){//infoArray 暂时把参数移出去
        console.log("geom loadapi() called ...");
        var sogouMapID="gsogoumap"+this.targetEl.id;
        if(!$("#go2map")[0]){
            var scriptdom = document.createElement('script');
            scriptdom.id="go2map";
            scriptdom.src='http://api.go2map.com/maps/js/api_v2.5.1.js';
            scriptdom.onload=function(){
                if(typeof(gsogouMap)=="undefined"||gsogouMap==null){
                    //初始化搜狗地图
                    console.log("geom onload() initSogouMap()...");
                    gsogouMap=initSogouMap(sogouMapID);
                }
            }
            document.body.appendChild(scriptdom)
        }else{
            if(typeof(gsogouMap)=="undefined"||gsogouMap==null){
                //初始化搜狗地图
                console.log("geom initSogouMap()...exist go2map")
                gsogouMap=initSogouMap(sogouMapID);
            }
        }

    }

    getTransformation() {
        console.log('geom getTransformation() called...'+'passthrough:'+this.passthrough.toString());
        gobj.config = this.transformation.config;
        return this.transformation;///*列选择器相关*/this.passthrough
    };

    // setConfig(config) {
    //     console.log('setConfig(config) called...');
    //     this.transformation.setConfig(config);//为了列选择器增加的
    //     this.pivot.setConfig(config);
    // };

    type() {
        console.log('geom type() called...');
        return 'agGrid';
    };
    /**
     * Activate. 当可视化插件被选择的时候唤醒
     */
    activate() {
        if (!this._active || this._dirty) {
            this.refresh();
            this._dirty = false;
        }
        this._active = true;
        console.log("geom 可视化插件被选中...")
    };
    /**
     * Refresh visualization.
     */
    refresh() {
        // override this
        console.warn('A chart is missing refresh function, it might not work preperly');
    }

    /**
     * Activate. 当可视化插件取消选择后唤醒
     */
    deactivate() {
        this._active = false;
        this.destroyLayout();
    };

    destroy() {
        // override this
        console.log("geom destroy() called ...");
        this.destroyLayout();
    }

    render(data) {
        console.log('geom rener(data) called...');

        var tableID="#"+this.targetEl.id;
        $(tableID).empty();

        //初始化布局
        this.initLayout();
        //初始化布局后初始化地图
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

        this.gridOptions.columnDefs = columnDefs;
        this.gridOptions.rowData = rowData;

        new agGrid.Grid(this.targetEl, this.gridOptions);

        gobj.gridOptions=this.gridOptions;

        this.createMapDataModel(data);

    };

    /*创建地图数据模型*/
    createMapDataModel(data){
        console.log("geom createMapDataModel(data) called ...");
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
                console.log("geom message: Please set " + fieldName + " in Settings");
            }
        };

        const config = this.getTransformation().config;
        const xIdx = getColumnIndex(config, 'CoordinatesX');
        const yIdx = getColumnIndex(config, 'CoordinatesY');
        const kindIdx=getColumnIndex(config, 'Kind');
        const tipIdx=getColumnIndex(config, 'MapTip');
        const hmIdx=getColumnIndex(config, 'HeatMapVal');

        if (typeof(gobj.kindIdx) == "undefined") {
            gobj.kindIdx=kindIdx;
        }
        if(typeof(gobj.hmIdx) == "undefined"){
            gobj.hmIdx=hmIdx;
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

        var geoDataRows=new Array();//画图要使用的数据
        var geoInfos=new Array();
        for(var j=0;j<data.rows.length;j++){
            var str="";
            if(typeof(xIdx)!="undefined"&&typeof(yIdx)!=="undefined"){
                var arrayX=(data.rows[j][xIdx]+"").split(',');//规定
                var arrayY=(data.rows[j][yIdx]+"").split(',');
                for(var x=0;x<arrayX.length;x++){
                    if(x==arrayX.length-1){
                        str+=arrayX[x]+","+arrayY[x];
                    }else {
                        str += arrayX[x] + "," + arrayY[x] + ",";
                    }
                }
                geoDataRows.push(str);
            }else{
                console.log("geom Please pass the X&Y&Kind column data!");
            }
            var infos;
            if(typeof(tipIdx)!="undefined"){
                infos=j+":"+data.columns[tipIdx].name+":"+data.rows[j][tipIdx];//tip
            }else{
                infos=j+":please set tip!";
            }
            geoInfos.push(infos);
        }
        //console.log("geoDataRows:"+JSON.stringify(geoDataRows));
//==================触发Stye栏的逻辑:start===============================================
        var gpointstyleID="#gpointstyle"+this.targetEl.id;
        var glinestyleID="#glinestyle"+this.targetEl.id;
        var gheatmapstyleID="#gheatmapstyle"+this.targetEl.id;
        var xdata=[];
        if(typeof(xIdx)!="undefined"){
            xdata=xdata.concat((data.rows[0][xIdx]+"").split(','));//用来判断是画点、画线(根据数据的数量)
            if(xdata.length==1){//点
                $(gpointstyleID).show();
                $(glinestyleID).hide();
                $(gheatmapstyleID).hide();
            }else if(xdata.length>1){//线
                $(gpointstyleID).hide();
                $(glinestyleID).show();
                $(gheatmapstyleID).hide();
            }
        }else{//选择器X没有值时显示点的设置页面
            $(gpointstyleID).show();
            $(glinestyleID).hide();
            $(gheatmapstyleID).hide();
        }
        if(typeof(hmIdx)!="undefined") {//调出热力图
            $(gpointstyleID).hide();
            $(glinestyleID).hide();
            $(gheatmapstyleID).show();
        }
//==================触发Stye栏的逻辑:end===============================================

//==================绑定style的风格:start==============================================
        var pointStyleMap=new Map();
        var lineStyleMap=new Map();
        var hmMap=new Map();

        if(gobj.kindIdx!=kindIdx||gobj.hmIdx!=hmIdx){//更换Kind字段后，清空表中的内容
            pointStyleMap.clear();
            lineStyleMap.clear();
            hmMap.clear();
            gobj.kindIdx=kindIdx;
            gobj.hmIdx=hmIdx;
        }

        //左侧栏设置
        var gmaptableID="#gmaptable"+this.targetEl.id;
        var gptitleID="#gptitle"+this.targetEl.id;
        var gltitleID="#gltitle"+this.targetEl.id;
        // var pointsetID="#pointset"+this.targetEl.id;
        // var gpointkindID="#gpointkind"+this.targetEl.id;
        // var pointiconID="#pointicon"+this.targetEl.id;

        if($(gpointstyleID).is(':visible')){
            $(gmaptableID).empty();
            if(!$(gptitleID)[0]){
                $(gmaptableID).append("<tr id='gptitle"+this.targetEl.id+"'><td>Kind</td><td>Icon</td></tr>");
                var pointicon="../../../../image/S20.png";//默认值
                kindSet.forEach(function(element, sameElement, set){
                    $(gmaptableID).append("<tr id='gtrp"+element+"'><td>"+element+"</td><td><select id='pointicon"+element+"' style='position:relative;width:80%;'><option value='../../../../image/S20.png'>S20</option><option value='../../../../image/ball-green-16.png'>ball</option><option value='../../../../image/ping.png'>pin</option><option value='../../../../image/flag_red.png'>flag</option><option value='../../../../image/point.png'>point</option></select></td></tr>");
                    var selectID="#pointicon"+element;
                    pointStyleMap.set(element+"",$(selectID).val());

                    //给select设置触发事件
                    $(selectID).change(function(){
                        pointStyleMap.set(element+"",$(selectID).val());
                    });
                });
                kindSet.clear();
            }
        }else if($(glinestyleID).is(':visible')){
            $(gmaptableID).empty();
            //设置默认值
            if(!$(gltitleID)[0]){
                $(gmaptableID).append("<tr id='gltitle"+this.targetEl.id+"'><td>Kind</td><td>Color</td><td>Weight</td></tr>");
            }
            var ccindex=0;
            kindSet.forEach(function(element, sameElement, set){
                var id="#gtrl"+element;
                if(!$(id)[0]){
                    $(gmaptableID).append("<tr id='gtrl"+element+"'><td>"+element+"</td><td id='gcolor"+ccindex+"' class='gstrokecolor' style='background-color:"+colors[ccindex%colors.length]+"'></td><td><input id='in"+ccindex+"' class='strokeweight' type='text' style= 'position:relative;width:25px' value=4 placeholder='4'/></td></tr>");
                }else{
                    $(id).html("<td>"+element+"</td><td id='gcolor"+ccindex+"' class='gstrokecolor' style='background-color:"+colors[ccindex%colors.length]+"'></td><td><input id='in"+ccindex+"' class='strokeweight' type='text' style= 'position:relative;width:25px' value=4 placeholder='4'/></td>");
                }
                //同时将格式添加到lineStyleMap
                var InitLineStyle=new Object();
                InitLineStyle.strokeColor=$(id).children('td').eq(1).css("background-color");
                InitLineStyle.strokeWeight=$(id).find("input").val();
                lineStyleMap.set(element+"",InitLineStyle);
                //给每个input元素设置值改变出发的事件
                $(id).find("input").change(function(){
                    var key=$(id).attr("id").replace("gtrl","");;
                    lineStyleMap.get(key).strokeWeight=$(id).find("input").val();
                });
                ccindex=ccindex+1;
            });
            kindSet.clear();

            //表格颜色点击事件
            $('#gylColor').remove();
            $('.gstrokecolor').gSelectColor({
                left: 220,
                onSelect: function(oCol,elem){
                    var color = $(oCol).attr('data-color');
                    //$(elem.outerHTML).css({'background-color':color});
                    var id="#"+elem.id;
                    $(id).css({'background-color':color});
                    var kindKey=elem.parentNode.id;
                    kindKey=kindKey.replace("gtrl","");
                    lineStyleMap.get(kindKey).strokeColor=color;
                }
            });
        }

//==================绑定style的风格:end================================================

//==================画point,line,bound的逻辑:start=========================================
        //画点
        var pointyesID="#pointyes"+this.targetEl.id;
        var clockID="#gclock"+this.targetEl.id;
        $(pointyesID).click(function(){
            //展示加载动画
            $(clockID).css("visibility","visible");
            $(clockID).css("overflow","visible");

            if(typeof(xIdx)!="undefined"&&typeof(yIdx)!=="undefined"){
                    for(var i=0;i<data.rows.length;i++){
                        var pointicon=pointStyleMap.get(kindRows[i]+"");
                        if(typeof(pointicon)=="undefined"){
                            pointicon="../../../../image/ball-green-16.png";//默认值
                        }
                        drawMarkers(geoDataRows[i] , pointicon ,geoInfos[i] );
                    }
            }else{
                console.log("geom Please bind the corresponding data!");
            }
            //关闭加载动画
            setTimeout(function(){
                $(clockID).css("visibility","hidden");
                $(clockID).css("overflow","hidden");
            },3000);
        });
        var pointnoID="#pointno"+this.targetEl.id;
        $(pointnoID).click(function(){
            gsogouMap.clearAll();
        });
        //画线
        var glineyesID="#glineyes"+this.targetEl.id;
        $(glineyesID).click(function(){
            if(typeof(xIdx)!="undefined"&&typeof(yIdx)!=="undefined"){
                //展示加载动画
                $(clockID).css("visibility","visible");
                $(clockID).css("overflow","visible");

                var cindex=0;
                for(var i=0;i<data.rows.length;i++){
                    var polyOptions=null;
                    if(typeof(lineStyleMap.get(kindRows[i]+""))!="undefined"){
                        polyOptions = {
                            strokeColor: lineStyleMap.get(kindRows[i]+"").strokeColor, /*'#FF4500'*/
                            strokeOpacity: 1.0,
                            strokeWeight: lineStyleMap.get(kindRows[i]+"").strokeWeight,
                            title:geoInfos[i],
                            map: gsogouMap
                        }
                    }else{
                        polyOptions = {
                            strokeColor: colors[cindex%colors.length], /*'#FF4500'*/
                            strokeOpacity: 1.0,
                            strokeWeight: 4,
                            title:geoInfos[i],
                            map: gsogouMap
                        }
                        if(cindex>=colors.length){
                            cindex=0;
                        }else{
                            cindex=cindex+1;
                        }
                    }
                    drawLine(geoDataRows[i],polyOptions);//linestring为需要传入的参数
                }

                setTimeout(function(){
                    $(clockID).css("visibility","hidden");
                    $(clockID).css("overflow","hidden");
                },3000);
            }else{
                console.log("geom Please bind the corresponding data!");
            }
        });
        var glinenoID="#glineno"+this.targetEl.id;
        $(glinenoID).click(function(){
            gsogouMap.clearAll();
        });
//==================画point,line,bound的逻辑:end=======================================

//==================画热力图逻辑:start=================================================
        //热力图数据单独取
        var hmPoints=[];
        var maxHMVal=0;
        for(var j=0;j<data.rows.length;j++){
            var point={};
            if(typeof(hmIdx)!="undefined"&&hmIdx!=null){
                var arrayX=(data.rows[j][xIdx]+"").split(',');//规定
                var arrayY=(data.rows[j][yIdx]+"").split(',');
                var arrayHM=(data.rows[j][hmIdx]+"").split(',');
                if(data.rows[j][hmIdx]>maxHMVal){
                    maxHMVal=data.rows[j][hmIdx];
                }
                if(arrayX.length==arrayHM.length){
                    for(var x=0;x<arrayX.length;x++){
                        point={
                            x: Number(arrayX[x]),
                            y: Number(arrayY[x]),
                            value: Number(arrayHM[x])
                        };
                        hmPoints.push(point);
                    }
                }else{
                    for(var x=0;x<arrayX.length;x++){
                        point={
                            x: Number(arrayX[x]),
                            y: Number(arrayY[x]),
                            value: Number(data.rows[j][hmIdx])
                        };//线的热力值只有一个
                        hmPoints.push(point);
                    }
                }

            }else{
                console.log("geom Please pass the HM column data!");
            }
        }
        var gheatmapsetID="#gheatmapset"+this.targetEl.id;
        var hotradiusID="#hotradius"+this.targetEl.id;
        var ghmtitleID="#ghmtitle"+this.targetEl.id;
        if($(gheatmapstyleID).is(':visible')){
            if(xdata.length==1){//点的热力图
                $(gmaptableID).empty();
                $( gheatmapsetID).click(function(){
                    var kindKey="HeatMapStyle";
                    var heatmapStyle=new Object();
                    heatmapStyle.radius=$(hotradiusID).val();
                    hmMap.set(kindKey,heatmapStyle);
                    if(!$(ghmtitleID)[0]){
                        $(gmaptableID).append("<tr id='ghmtitle'><td>Style</td><td>Radius</td></tr>");
                    }
                    hmMap.forEach(function (value, key, map) {
                        var id="#gtrhm"+key;
                        if(!$(id)[0]){
                            $(gmaptableID).append("<tr id='gtrhm"+key+"'><td>"+key+"</td><td>"+value.radius+"</td></tr>");
                        }else{
                            $(id).html("<td>"+key+"</td><td>"+value.radius+"</td>");
                        }
                    });
                });
            }else if(xdata.length>1){//线的热力图
                $(gmaptableID).empty();
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

                $(gmaptableID).append("<tr id='ghmtitle"+this.targetEl.id+"'><td>Heat Level</td><td>Heat Scope</td></tr>");
                hmMap.forEach(function (value, key, map) {
                    var id=key;
                    $(gmaptableID).append("<tr><td style='background-color:"+key+"'></td><td>"+value+"</td></tr>");
                });
            }
        }

        //画热力图
        var gheatmapyesID="#gheatmapyes"+this.targetEl.id;
        var gsogoumapID="#gsogoumap"+this.targetEl.id;
        var heatmapvalueID="#heatmapvalue"+this.targetEl.id;
        var vminID="#vmin"+this.targetEl.id;
        var vmaxID="#vmax"+this.targetEl.id;
        $(gheatmapyesID).click(function () {
            console.log("热力图按钮被点击...");
            if(typeof(xIdx)!="undefined"&&typeof(yIdx)!=="undefined"&&typeof(hmIdx)!="undefined") {
                //展示加载动画
                $(clockID).css("visibility","visible");
                $(clockID).css("overflow","visible");

                //调用画热力图的函数
                if(xdata.length==1){//点
                    drawHeatMap(gsogoumapID,heatmapvalueID,vminID,vmaxID,hmPoints,hmMap.get(kindRows[0]+""));//points为传入的热力图需要的数据
                }else{//线的热力图，只是改变线的颜色
                    for(var i=0;i<data.rows.length;i++){
                        var polyOptions=null;
                        var hcolor=null;
                        if(data.rows[i][hmIdx]<(maxHMVal/5.0)){
                            //白
                            hcolor='#2783e6';
                        }else if(data.rows[i][hmIdx]>(maxHMVal/5.0)&&data.rows[i][hmIdx]<(maxHMVal*2.0/5.0)){
                            //蓝
                            hcolor='#0000FF';
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
                        polyOptions = {
                            strokeColor: hcolor, /*'#FF4500'*/
                            strokeOpacity: 1.0,
                            strokeWeight: 4,
                            title:geoInfos[i],
                            map: gsogouMap
                        }
                        drawLine(geoDataRows[i],polyOptions);//linestring为需要传入的参数
                    }
                }

                setTimeout(function(){
                    $(clockID).css("visibility","hidden");
                    $(clockID).css("overflow","hidden");
                },3000);
            }else{
                console.log("geom Please bind the corresponding data!");
            }
        });
        var gheatmapnoID="#gheatmapno"+this.targetEl.id;
        $(gheatmapnoID).click(function () {
            if(xdata.length==1){
                clearHeatMap();
            }else{
                gsogouMap.clearAll();
            }
        });
//==================画热力图逻辑:end=================================================
    }

    initLayout(){
        //创建逻辑
        var styeID="#gpopUp"+this.targetEl.id;
        var mapID="#gsogoumap"+this.targetEl.id;
        var toolID="#gtool"+this.targetEl.id;
        if(!$(styeID)[0]){//!$('#gpopUp')[0]
            this.initStyeDiv();
        }
        if(!$(mapID)[0]) {//!$('#gsogoumap')[0]
            this.initMapDiv();//创建地图的div
        }
        if(!$(toolID)[0]) {//!$('#gtool ')[0]
            this.initToolDiv();
        }
        var clockID="#gclock"+this.targetEl.id;
        if(!$(clockID)[0]) {
            this.initTimeClock();
        }
        //展示逻辑
        if($(mapID)[0]){
            console.log("geom 显示sogoumap div...");
            $(mapID).show();
            $(mapID).css('display','block');
        }
        if($(toolID)[0]){
            $(toolID).show();
            $(toolID).css('display','block');
            console.log("geom 显示tool div...");
        }
        var sogouMapID="gsogoumap"+this.targetEl.id;
        if((typeof(gsogouMap)=="undefined"&&($("#go2map")[0]))||(gsogouMap==null&&($("#go2map")[0]))){
            console.log("geom activate initsogoumap()...")
            gsogouMap=initSogouMap(sogouMapID);//激活的时候也初始化地图
        }

    }

    destroyLayout(){
        var styeID="#gpopUp"+this.targetEl.id;
        var mapID="#gsogoumap"+this.targetEl.id;
        var toolID="#gtool"+this.targetEl.id;
        //清空表div的子元素
        var tableID="#"+this.targetEl.id;
        $(tableID).empty();
        //隐藏逻辑
        if($(mapID)[0]){
            console.log("geom 隐藏sogoumap div...");
            $(mapID).hide();
        }
        if($(toolID)[0]){
            $(toolID).hide();
            console.log("geom 隐藏tool div...");
        }

        $(styeID).css("visibility","hidden");
        $(styeID).css("overflow","hidden");

//=============销毁布局==============================
        $(mapID).remove();
        $(toolID).remove();
        $(styeID).remove();
        var clockID="#gclock"+this.targetEl.id;
        $(clockID).remove();
//==========销毁布局的同时销毁gsogouMap对象==========
        gsogouMap=null;

    }


//=============工具方法=========================================================
    setStyeClick(){
        var styeID="#gpopUp"+this.targetEl.id;
        var ghidePopupID="#ghidePopup"+this.targetEl.id;
        $(ghidePopupID).click(function(){
            $(styeID).css("visibility","hidden");
            $(styeID).css("overflow","hidden");
        });
    }

    setToolClick(){
//==============工具栏点击逻辑：start=================================================
        var styeID="#gpopUp"+this.targetEl.id;
        var gshowPopupID="#gshowPopup"+this.targetEl.id;
        $(gshowPopupID).click(function(){
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

        var gdrawpointID="#gdrawpoint"+this.targetEl.id;
        var gdrawpointdivID="#gdrawpointdiv"+this.targetEl.id;
        var gdiv1ID="#gdiv1"+this.targetEl.id;
        var gdiv2ID="#gdiv2"+this.targetEl.id;
        var gdiv3ID="#gdiv3"+this.targetEl.id;
        var gdiv4ID="#gdiv4"+this.targetEl.id;
        var gdiv5ID="#gdiv5"+this.targetEl.id;
        var gdiv6ID="#gdiv6"+this.targetEl.id;
        var gdrawlinkID="#gdrawlink"+this.targetEl.id;
        var gdrawlinkdivID="#gdrawlinkdiv"+this.targetEl.id;
        var gdrawgeoID="#gdrawgeo"+this.targetEl.id;
        var gdrawgeodivID="#gdrawgeodiv"+this.targetEl.id;

        $(gdrawpointID).click(function () {
            $(gdrawpointdivID).toggle();
            $(gdiv2ID).toggle();
            $(gdiv3ID).toggle();
            $(gdiv4ID).toggle();
            $(gdiv5ID).toggle();
            $(gdiv6ID).toggle();
            $(gshowPopupID).toggle();
        });
        $(gdrawlinkID).click(function () {
            $(gdrawlinkdivID).toggle();
            $(gdiv1ID).toggle();
            $(gdiv3ID).toggle();
            $(gdiv4ID).toggle();
            $(gdiv5ID).toggle();
            $(gdiv6ID).toggle();
            $(gshowPopupID).toggle();
        });
        $(gdrawgeoID).click(function () {
            $(gdrawgeodivID).toggle();
            $(gdiv1ID).toggle();
            $(gdiv2ID).toggle();
            $(gdiv4ID).toggle();
            $(gdiv5ID).toggle();
            $(gdiv6ID).toggle();
            $(gshowPopupID).toggle();
        });

//==============工具栏点击逻辑：end=================================================
        //==============画点、画线：start======================================================
        var gdrawpointsureID="#gdrawpointsure"+this.targetEl.id;
        var gpointID="#gpoint"+this.targetEl.id;
        var gcheckdrawpointID="#gcheckdrawpoint"+this.targetEl.id;
        var gtoolpointiconID="#gtoolpointicon"+this.targetEl.id;
        $(gdrawpointsureID).click(function () {
            if (!$(gpointID).val()) {
                $(gcheckdrawpointID).show();
                $(gcheckdrawpointID).text("*Please set the values of X and Y!");
            } else {
                $(gcheckdrawpointID).hide();
                //drawMarkers($(gpointID).val(),$(gtoolpointiconID).val(),"");gridOptions
                drawMarkers($(gpointID).val(),$(gtoolpointiconID).val(),"");
            }
        });
        var gclearpointID="#gclearpoint"+this.targetEl.id;
        $(gclearpointID).click(function () {
            gsogouMap.clearAll();
        });
        //画线
        var gdrawlinesureID="#gdrawlinesure"+this.targetEl.id;
        var glineID="#gline"+this.targetEl.id;
        var gcheckdrawlineID="#gcheckdrawline"+this.targetEl.id;
        var glinecolorID="#glinecolor"+this.targetEl.id;
        var glineweightID="#glineweight"+this.targetEl.id;
        $(gdrawlinesureID).click(function () {
            if (!$(glineID).val()) {
                $(gcheckdrawlineID).show();
                $(gcheckdrawlineID).text("*Please enter the correct link coordinate value!");
            } else {
                $(gcheckdrawlineID).hide();
                var polyOptions = {
                    strokeColor: $(glinecolorID).val(), /*'#FF4500'*/
                    strokeOpacity: 1.0,
                    strokeWeight: $(glineweightID).val()
                }
                drawLine($(glineID).val(), polyOptions);
            }
        });
        var gclearlineID="#gclearline"+this.targetEl.id;
        $(gclearlineID).click(function () {
            gsogouMap.clearAll();
        });
//==============画点、画线：end======================================================

//==============画geo：start======================================================
        var gdrawgeosureID="#gdrawgeosure"+this.targetEl.id;
        var ggeoID="#ggeo"+this.targetEl.id;
        var gcheckdrawgeoID="#gcheckdrawgeo"+this.targetEl.id;
        var ggeocolorID="#ggeocolor"+this.targetEl.id;
        var ggeoopacityID="#ggeoopacity"+this.targetEl.id;
        var ggeoweightID="#ggeoweight"+this.targetEl.id;
        $(gdrawgeosureID).click(function () {
            if (!$(ggeoID).val()) {
                $(gcheckdrawgeoID).show();
                $(gcheckdrawgeoID).text("*Please enter the correct geo coordinate value!");
            } else {
                $(gcheckdrawgeoID).hide();
                drawBound($(ggeoID).val(),"", $(ggeocolorID).val(), $(ggeoopacityID).val(), $(ggeoweightID).val());
            }
        });
        var gcleargeoID="#gcleargeo"+this.targetEl.id;
        $(gcleargeoID).click(function () {
            gsogouMap.clearAll();
        });
//==============画geo：end======================================================
    }

    initMapDiv(){
        console.log("geom initMapDiv() called ...");
        //为了解决搜狗地图显示的bug添加的style
        var mapStyle=document.createElement('style');
        mapStyle.innerHTML="#gsogoumap"+this.targetEl.id+" img { max-width:none }";
        document.head.appendChild(mapStyle);

        //初始化搜狗地图
        var mapDiv=document.createElement('div');
        mapDiv.id="gsogoumap"+this.targetEl.id;
        mapDiv.style="position:relative;height:100%;width:50%;float:left;";
        //将搜狗地图的div添加到路线信息表的父节点中
        this.targetEl.parentNode.appendChild(mapDiv);
    }

    //初始化风格栏
    initStyeDiv(dom){
        console.log("geom initStyeDiv() called ...");
        //初始化style
        var stypeStyle=document.createElement('style');
        stypeStyle.innerHTML="#gpopUp"+this.targetEl.id+"{\n" +
            "\t\t\tposition: absolute;\n" +
            "\t\t\tvisibility: hidden;\n" +
            "\t\t\toverflow: hidden;\n" +
            "\t\t\tbackground-color: white;\n" +
            "\t\t\tpadding:5px;\n" +
            "\t\t\tz-index: 99999;\n" +
            "\t\t\twidth:580px; height:340px; margin-top: 0px;\n" +
            "\t\t\tborder-color:black; border-width:4px\n" +
            "\t\t}\n" +
            "\t\t#gtableoutter"+this.targetEl.id+"{\n" +
            "\t\t\tposition:relative;  height:100%;  width:75%;  float:left;background-color: white;\n" +
            "\t\t\tborder-style:ridge;border-color:white; border-width:4px;text-align: center;\n" +
            "\t\t}\n" +
            "\t\t#gtableinner"+this.targetEl.id+"{\n" +
            "\t\t\tposition:relative;  height:95%;  width:95%;  float:left;background-color: rgba(0,255,0,0.2);\n" +
            "\t\t\tmargin-top: 2%;margin-left: 2%;overflow-y: scroll;\n" +
            "\t\t}\n" +
            "\t\t#gmaptable"+this.targetEl.id+"{\n" +
            "\t\t\tposition:relative;  height:90%;  width:95%;  float:left;background-color:white;\n" +
            "\t\t\tmargin-top: 4%;margin-left: 2%;overflow-y: scroll;\n" +
            "\t\t}\n" +
            "\n" +
            "\t\t#gtypestyle"+this.targetEl.id+"{\n" +
            "\t\t\tposition:relative;  height:100%;  width:20%;  float:left;text-align: center;\n" +
            "\t\t\tborder-style:ridge; border-color:rgba(0,0,0,0.4); border-width:4px;\n" +
            "\t\t}\n" +
            "\t\t.divtitle{\n" +
            "\t\t\tposition:relative;  height:8%;  width:100%; margin-top:4px; text-align: center;font-weight:bold;\n" +
            "\t\t}\n" +
            "\t\t.typetitle{\n" +
            "\t\t\tposition:relative;  height:5%;  width:100%; margin-top:4px; text-align: center;font-weight:bold;\n" +
            "\t\t}\n" +
            "\t\t.gpointstyle{\n" +
            "\t\t\tposition: relative;  height: 60%; width:98%; text-align: center;background-color: rgba(0,255,0,0.2);\n" +
            "\t\t}\n" +
            "\t\t.divstyle{\n" +
            "\t\t\tdisplay:none; position: relative;  height: 60%; width:98%; text-align: center;background-color: rgba(0,255,0,0.2);\n" +
            "\t\t}\n" +
            "\n" +
            "\t\t.gylColor {\n" +
            "\t\t\tposition: absolute;\n" +
            "\t\t\tz-index: 99999;\n" +
            "\t\t\twidth: 250px;\n" +
            "\t\t\tbackground: #fff;\n" +
            "\t\t\tbox-shadow: 1px 1px 2px #c6d9f1, -1px -1px 2px #c6d9f1;\n" +
            "\t\t\tfont-size: 14px;\n" +
            "\t\t\tcolor: #000;\n" +
            "\t\t}\n" +
            "\t\t.gylColor .gaCol {\n" +
            "\t\t\tdisplay: inline-block;\n" +
            "\t\t\tfloat: left;\n" +
            "\t\t\twidth: 15px;\n" +
            "\t\t\theight: 15px;\n" +
            "\t\t\tmargin: 0 7px 7px 0;\n" +
            "\t\t\tborder: 1px solid #eee;\n" +
            "\t\t\tcursor: pointer;\n" +
            "\t\t}\n" +
            "\t\t.gylColor .gaCol:nth-child(10n) {\n" +
            "\t\t\tmargin-right: 0;\n" +
            "\t\t}\n" +
            "\t\t.gylColor-default {\n" +
            "\t\t\tpadding: 7px;\n" +
            "\t\t}\n" +
            "\t\t.gylColor-custom ul {\n" +
            "\t\t\toverflow: hidden;\n" +
            "\t\t\tpadding: 7px 7px 0;\n" +
            "\t\t}\n" +
            "\t\t.gylColor .gtitle {\n" +
            "\t\t\tpadding: 7px;\n" +
            "\t\t\tbackground-color: #f4f4f8;\n" +
            "\t\t}";
        document.head.appendChild(stypeStyle);

        //初始化div
        var styeDiv = document.createElement('div');
        //这里需要改造一下

        styeDiv.id = "gpopUp"+this.targetEl.id;
        styeDiv.innerHTML="<div id=\"gtypestyle"+this.targetEl.id+"\" >\n" +
            "\t\t<span class=\"divtitle\" size=\"30px\">STYE</span><hr />\n" +
            "\t\t<div id=\"gpointstyle"+this.targetEl.id+"\" class=\"gpointstyle\">\n" +
            "\t\t\t<span class=\"typetitle\" size=\"18px\">PointStyle</span><br/>\n" +
            "\t\t\t<button id=\"pointyes"+this.targetEl.id+"\" style=\"position:relative;margin-top:30px;width:80%;\">Draw</button>\n" +
            "\t\t\t<button id=\"pointno"+this.targetEl.id+"\" style=\"position:relative;margin-top:30px;width:80%;\">Clear</button>\n" +
            "\t\t</div >\n" +
            "\t\t<div id=\"glinestyle"+this.targetEl.id+"\" class=\"divstyle\">\n" +
            "\t\t\t<span class=\"typetitle"+this.targetEl.id+"\" size=\"18px\">LineStyle</span>\n" +
            "\t\t\t<button id=\"glineyes"+this.targetEl.id+"\" style=\"position:relative;margin-top:30px;width:80%\">Draw</button>\n" +
            "\t\t\t<button id=\"glineno"+this.targetEl.id+"\" style=\"position:relative;margin-top:30px;width:80%\">Clear</button>\n" +
            "\t\t</div>\n" +
            "\t\t<div id=\"gheatmapstyle"+this.targetEl.id+"\" class=\"divstyle\">\n" +
            "\t\t\t<span class=\"typetitle\" size=\"18px\">HeatMapStyle</span>\n" +
            "\t\t</select><br/>\n" +
            "\t\t\tCircleRadius:<select id=\"hotradius"+this.targetEl.id+"\" style=\"position:relative;width:60%;margin-top:4px;\">\n" +
            "\t\t\t<option value=10 >10</option>\n" +
            "\t\t\t<option value=15 >15</option>\n" +
            "\t\t\t<option value=20 >20</option>\n" +
            "\t\t\t<option value=25 >25</option>\n" +
            "\t\t\t<option value=30 >30</option>\n" +
            "\t\t\t<option value=35 >35</option>\n" +
            "\t\t\t<option value=40 >40</option>\n" +
            "\t\t</select><br/>\n" +
            "\t\t\tMin:<span id=\"vmin"+this.targetEl.id+"\" style=\"position:relative;margin-top:4px;\">0</span>&nbsp;&nbsp;\n" +
            "\t\t\tMax:<span id=\"vmax"+this.targetEl.id+"\" style=\"position:relative;margin-top:4px;\">0</span><br/>\n" +
            "\t\t\t<image style=\"position:relative;margin-top:4px;width: 100%;\" src=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAAAKCAYAAABCHPt+AAAAnklEQVRIS+2WQQqDQBAES5wB/f8/Y05RcMWwSu6JIT0Dm4WlH1DUdHew7/z6WYFhhnGRpnlhAEaQpi/ADbh/np0MiBhGhW+2ymFU+DZfg1EhaoB4jCFuMYYcQKZrXwPEVvm5Og0pcYakBvI35G1jNIZ4jCHexxjSpz9ZFUjAynLbpOvqteaODkm9sloz5JF+ZTVmSAWSu9Qb65AvgDwBQoLgVEgPaVsAAAAASUVORK5CYII=\"></image>\n" +
            "\t\t\t<span style=\"position:relative;margin-top:4px;\">Value:</span><br/>\n" +
            "\t\t\t<span id=\"heatmapvalue"+this.targetEl.id+"\" style=\"position:relative;margin-top:4px;width: 100%;background-color: red;\">The value of HeatMap</span><br/>\n" +
            "\t\t\t<button id=\"gheatmapset"+this.targetEl.id+"\" style=\"position:relative;margin-top:4px;width:80%;margin-bottom:10px;\">StyleSet</button>\n" +
            "\t\t\t<button id=\"gheatmapyes"+this.targetEl.id+"\" style=\"position:relative;margin-top:4px;width:45%;margin-bottom:10px;\">Draw</button>\n" +
            "\t\t\t<button id=\"gheatmapno"+this.targetEl.id+"\" style=\"position:relative;margin-top:4px;width:45%;margin-bottom:10px;\">Clear</button>\n" +
            "\t\t</div>\n" +
            "\t\t<div ></div>\n" +
            "\t\t<button id=\"ghidePopup"+this.targetEl.id+"\" style=\"position:relative;width:60%;margin-top: 30px;\">Close</button>\n" +
            "\t</div>\n" +
            "\t<div id=\"gtableoutter"+this.targetEl.id+"\" >\n" +
            "\t\t<div id=\"gtableinner"+this.targetEl.id+"\">\n" +
            "\t\t\t<table id=\"gmaptable"+this.targetEl.id+"\" border=\"1\">\n" +
            "\t\t\t</table>\n" +
            "\t\t</div>\n" +
            "\t</div>";
        this.targetEl.parentNode.appendChild(styeDiv);

        this.setStyeClick();

    }

    //初始化上面工具栏
    initToolDiv(){
        console.log("geom initToolDiv()方法被调用，初始化工具栏...");

        var toolStyle = document.createElement('style');
        toolStyle.innerHTML = "#gtool"+this.targetEl.id+"{\n" +
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
        toolDiv.id = "gtool"+this.targetEl.id;
        toolDiv.innerHTML = "<span size=\"18px\" class=\"tooltitle\">Tools</span>\n" +
            "\t\t<div id=\"gdiv1"+this.targetEl.id+"\" class=\"tooldivfirst\" >\n" +
            "\t\t  <button id=\"gdrawpoint"+this.targetEl.id+"\" class=\"toolbu\" >DrawPoint</button>\n" +
            "\t\t  <div id=\"gdrawpointdiv"+this.targetEl.id+"\" class=\"budiv\">\n" +
            "\t\t\t<span >Ponits(x1,y1,x2,y2,...):</span>\n" +
            "\t\t\t<input id=\"gpoint"+this.targetEl.id+"\" class=\"divinput\" style=\"\"/><br/>\n" +
            "\t\t\t  Icon:<select id=\"gtoolpointicon"+this.targetEl.id+"\" style=\"position:relative;width:80%;margin-top:4px\">\n" +
            "\t\t\t  <option value=\"../../../../image/ball-green-16.png\">ball</option>\n" +
            "\t\t\t  <option value=\"../../../../image/ping.png\">pin</option>\n" +
            "\t\t\t  <option value=\"../../../../image/flag_red.png\">flag</option>\n" +
            "\t\t\t  <option value=\"../../../../image/point.png\">point</option>\n" +
            "\t\t\t  <option value=\"../../../../image/S20.png\">S20</option>\n" +
            "\t\t  </select><br/>\n" +
            "\t\t\t<span id=\"gcheckdrawpoint"+this.targetEl.id+"\" style=\"display:none;position:relative;color:red\"></span><br/>\n" +
            "\t\t\t<button id=\"gdrawpointsure"+this.targetEl.id+"\" style=\"position:relative;margin-top:0px;width:45%;margin-bottom:10px;\">Draw</button>\n" +
            "\t\t\t<button id=\"gclearpoint"+this.targetEl.id+"\" style=\"position:relative;margin-top:0px;width:45%;margin-bottom:10px;\">Clear</button>\n" +
            "\t\t  </div>\n" +
            "\t    </div >\n" +
            "\t    <div id=\"gdiv2"+this.targetEl.id+"\" class=\"tooldivother\">\n" +
            "\t\t  <button id=\"gdrawlink"+this.targetEl.id+"\" class=\"toolbu\">DrawLink</button>\n" +
            "\t\t  <div id=\"gdrawlinkdiv"+this.targetEl.id+"\" class=\"budiv\">\n" +
            "\t\t\t  <span >Line(x1,y1,x2,y2,...):</span><br/>\n" +
            "\t\t\t  <input id=\"gline"+this.targetEl.id+"\" style=\"position:relative;width:80%;margin-top:4px\"/><br/>\n" +
            "\t\t\t  LineColor:<select id=\"glinecolor"+this.targetEl.id+"\" style=\"position:relative;width:80%;margin-top:4px;\">\n" +
            "\t\t\t\t\t\t<option value='red'>red</option>\n" +
            "\t\t\t\t\t\t<option value='blue'>blue</option>\n" +
            "\t\t\t\t\t\t<option value='green'>green</option>\n" +
            "\t\t\t  </select><br/>\n" +
            "\t\t\t  LineWeight:<select id=\"glineweight"+this.targetEl.id+"\" style=\"position:relative;width:80%;margin-top:4px;\">\n" +
            "\t\t\t\t  <option value=1 >1</option>\n" +
            "\t\t\t\t  <option value=4 >4</option>\n" +
            "\t\t\t\t  <option value=8 >8</option>\n" +
            "\t\t\t  </select><br/>\n" +
            "\t\t\t<span id=\"gcheckdrawline"+this.targetEl.id+"\" style=\"display:none;position:relative;color:red\"></span><br/>\n" +
            "\t\t\t<button id=\"gdrawlinesure"+this.targetEl.id+"\" style=\"position:relative;margin-top:4px;margin-bottom:10px;width:45%\">Draw</button>\n" +
            "\t\t\t<button id=\"gclearline"+this.targetEl.id+"\" style=\"position:relative;margin-top:4px;margin-bottom:10px;width:45%\">Clear</button>\n" +
            "\t\t  </div>\n" +
            "\t    </div>\n" +
            "\t    <div id=\"gdiv3"+this.targetEl.id+"\" class=\"tooldivother\">\n" +
            "\t\t    <button id=\"gdrawgeo"+this.targetEl.id+"\" class=\"toolbu\">DrawBound</button>\n" +
            "\t\t    <div id=\"gdrawgeodiv"+this.targetEl.id+"\" class=\"budiv\">\n" +
            "\t\t\t\t<span >Geo(x1,y1,x2,y2,...):</span><br/>\n" +
            "\t\t\t\t<input id=\"ggeo"+this.targetEl.id+"\" style=\"position:relative;width:80%;margin-top:4px\"/><br/>\n" +
            "\t\t\t\tStrokeColor: <select id=\"ggeocolor"+this.targetEl.id+"\" style=\"position:relative;width:80%;margin-top:4px;\">\n" +
            "\t\t\t\t\t<option value='red'>red</option>\n" +
            "\t\t\t\t\t<option value='blue'>blue</option>\n" +
            "\t\t\t\t\t<option value='green'>green</option>\n" +
            "\t\t\t\t</select><br/>\n" +
            "\t\t\t\tStrokeOpacity: <select id=\"ggeoopacity"+this.targetEl.id+"\" style=\"position:relative;width:80%;margin-top:4px;\">\n" +
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
            "\t\t\t\tstrokeWeight: <select id=\"ggeoweight"+this.targetEl.id+"\" style=\"position:relative;width:80%;margin-top:4px;\">\n" +
            "\t\t\t\t\t<option value=1>1</option>\n" +
            "\t\t\t\t\t<option value=5>5</option>\n" +
            "\t\t\t\t\t<option value=10>10</option>\n" +
            "\t\t\t\t</select><br/>\n" +
            "\t\t\t\t<span id=\"gcheckdrawgeo"+this.targetEl.id+"\" style=\"display:none;position:relative;color:red\"></span><br/>\n" +
            "\t\t\t\t<button id=\"gdrawgeosure"+this.targetEl.id+"\" style=\"position:relative;margin-top:4px;width:45%;margin-bottom:10px;\">Draw</button>\n" +
            "\t\t\t\t<button id=\"gcleargeo"+this.targetEl.id+"\" style=\"position:relative;margin-top:4px;width:45%;margin-bottom:10px;\">Clear</button>\n" +
            "\t\t\t</div>\n" +
            "\t    </div>\n" +
            "\t    <div  id=\"div6"+this.targetEl.id+"\"class=\"tooldivlast\">\n" +
            "\t\t\t<button id=\"gshowPopup"+this.targetEl.id+"\" style=\"position:relative;width:80%;margin-top: 10px\">Draw</button>\n" +
            "\t    </div>";
        this.targetEl.parentNode.appendChild(toolDiv);

        this.setToolClick();

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
        clockDiv.id = "gclock"+this.targetEl.id;
        clockDiv.style="position: absolute;\n" +
            "\t\t\tvisibility: hidden;\n" +
            "\t\t\toverflow: hidden;\n" +
            "\t\t\tbackground-color: rgba(0, 0, 0, 0);\n" +
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
var gsogouMap;
var projection;
var colors = ["#00FFFF", "#0000FF", "#00FF00", "#8A2BE2",  "#FFFF00", "#A52A2A", "#FF0000", "#DEB887", "#8B0000", "#5F9EA0","#D2691E","#6495ED","#008B8B","#B8860B","#006400"];
var heatmapInstance;
//========搜狗地图画图相关变量（如图的颜色等）：end=====================================

//========初始化搜狗地图:start==========================================================
function initSogouMap(sogouMapID){
    // if(gobj.InitFlag) {
    //     gobj.InitFlag = false;
        console.log("geom initSogouMap() called...");
        var myLatlng = new window.sogou.maps.LatLng(39.992792, 116.326142);
        var myOptions = {
            zoom: 9,
            center: myLatlng,
            mapTypeId: window.sogou.maps.MapTypeId.ROADMAP
        }
        return new window.sogou.maps.Map(document.getElementById(sogouMapID), myOptions);;
    // }
}
//搜狗地图上画点
function drawPoint(point){
    var icon = '../../../../image/pin.png';//这里图片目录需要修改
    console.log("geom 画点函数中的图标为："+icon+"=="+JSON.stringify(icon)+"此时的sogouMap对象："+gsogouMap);
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
        map: gsogouMap,
    });
}
//移动图的位置
function mySetCenter(x,y){
    var point = new window.sogou.maps.Point(Number(x),Number(y));
    gsogouMap.setCenter(point);
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
        map: gsogouMap
    });
}
//========初始化搜狗地图:end==========================================================

//========画热力图函数:start==========================================================
function drawHeatMap(gsogoumapID,heatmapvalueID,vminID,vmaxID,points,circleradius){
    console.log("geom drawHeatMap(mapParas)函数被调用...");
    var scriptDom=null;
    //引入heatmap.js库
    if(!$("#heatmapjs")[0]){
        console.log("geom 开始添加heatmap.js相关依赖...");
        scriptDom=document.createElement('script');
        scriptDom.id="heatmapjs";
        scriptDom.src="https://cdn.bootcss.com/heatmap.js/2.0.2/heatmap.min.js";
        document.head.appendChild(scriptDom);

        scriptDom.onload=function(){
            callHeatMapAPI(gsogoumapID,heatmapvalueID,vminID,vmaxID,points,circleradius);
            //缩放后要重新计算位置
            window.sogou.maps.event.addListener(gsogouMap, 'zoom_changed', function() {
                //重新计算前清空原来的热力图
                clearHeatMap();
                callHeatMapAPI(gsogoumapID,heatmapvalueID,vminID,vmaxID,points,circleradius);
            });
        }
    }else{
        callHeatMapAPI(gsogoumapID,heatmapvalueID,vminID,vmaxID,points, circleradius);
        //缩放后要重新计算位置
        window.sogou.maps.event.addListener(gsogouMap, 'zoom_changed', function() {
            clearHeatMap();
            callHeatMapAPI(gsogoumapID,heatmapvalueID,vminID,vmaxID,points,circleradius);
        });
    }

}
function callHeatMapAPI(gsogoumapID,heatmapvalueID,vminID,vmaxID,points,circleradius){
    //将经纬度转化成像素
    var pixelpoints=[];
    //获取投影对象
    projection=gsogouMap.getProjection();
    //points数组转换
    var centerPoint;
    var max = 0;
    for(var i=0;i<points.length;i++){
        if(points[i].value>max){
            max=points[i].value;
        }
        if(points[i].x==0||points[i].y==0){
            console.log("画点热力图时坐标的相关值不能为0！");
        }else{
            if(typeof(centerPoint)=="undefined"){
                centerPoint= new window.sogou.maps.Point(points[i].x,points[i].y);
                gsogouMap.setCenter(centerPoint);
            }
            var point=setPosition(points[i]);//每一个point包含x,y,value属性
            pixelpoints.push(point);
        }

    }

    console.log("geom 开始画热力图...");
    //热力图提示相关
    var mapContainer=document.querySelector(gsogoumapID);
    if(typeof(circleradius)!="undefined"){
        heatmapInstance = h337.create({
            container: mapContainer,
            radius: Number(circleradius.radius),//设置热力图光圈半径大小 [0,+∞]
            onExtremaChange: function onExtremaChange(data) {
                updateLegend(data,vminID,vmaxID);
            }
        });
    }else{
        heatmapInstance = h337.create({
            container: mapContainer,
            radius: 30,//设置热力图光圈半径大小 [0,+∞]
            onExtremaChange: function onExtremaChange(data) {
                updateLegend(data,vminID,vmaxID);
            }
        });
    }


    /* tooltip code start */
    var tooltip = document.querySelector(heatmapvalueID);
    function updateTooltip(x, y, value) {
        // + 15 for distance to cursor
        tooltip.innerHTML = value;
    };
    mapContainer.onmousemove = function(ev) {
        var x = ev.layerX;
        var y = ev.layerY;
        // getValueAt gives us the value for a point p(x/y)
        var value = heatmapInstance.getValueAt({
            x: x,
            y: y
        });
        tooltip.style.display = 'block';
        updateTooltip(x, y, value);
    };
    //----------热力图需要的数据类型-----------------------------------------------------
    //构建一些随机数据点（目前先用假的数据，后期再添加）
    // var pointss = [];
    // var max = 0;
    // var width = 600;
    // var height = 400;
    // var len = 200;
    // while (len--) {
    //     var val = Math.floor(Math.random()*100);
    //     max = Math.max(max, val);
    //     var point = {
    //         x: Math.floor(Math.random()*width),
    //         y: Math.floor(Math.random()*height),
    //         value: val
    //     };
    //     pointss.push(point);
    // }
    //--------------------------------------------------------------------

    var datas = {
        max: max,
        data: pixelpoints
    };
    heatmapInstance.setData(datas);
    //将地图中心
    //point = new window.sogou.maps.Point(Number(strs[i]),Number(strs[i + 1]));
}

//设置位置
function setPosition(point)
{
    if(!point)return;
    var po={};
    po.x=parseFloat(point.x);
    po.y=parseFloat(point.y);
    //计算存放可拖动地图的 DOM 元素中指定地理位置的像素坐标。
    //var divPixelCoord=projection.fromLatLngToDivPixel(po);
    var rePo={};
    //设置层到点击的位置
    // rePo.x=divPixelCoord.x;
    // rePo.y=divPixelCoord.y;
    rePo.value=point.value;

    // //计算地图外部容器的 DOM 元素中指定地理位置的像素坐标。
    var containerPixelCoord=projection.fromLatLngToContainerPixel(po);
    //设置层到点击的位置
    rePo.x=containerPixelCoord.x;
    rePo.y=containerPixelCoord.y;

    return rePo;
}

function updateLegend(data,vminID,vmaxID) {
    // the onExtremaChange callback gives us min, max, and the gradientConfig
    // so we can update the legend
    $(vminID).text(data.min);
    $(vmaxID).text(data.max);
}
//清除热力图
function clearHeatMap(){
    var points = [];
    var datas= {
        max: 0,
        data: points
    };
    heatmapInstance.setData(datas);
}

//========画热力图函数:end==========================================================

//==================工具栏相关函数：start==========================================
//画点
function drawMarkers(lonlats,pointicon,geoInfo){//gridOptions用来设定表格点击事件
    var strs= new Array();
    strs = lonlats.split(",");
    var point;
    for(var i = 0; i < strs.length; i = i + 2){
        point = new window.sogou.maps.Point(Number(strs[i]),Number(strs[i + 1]));

        var marker = new window.sogou.maps.Marker({
            position: point,
            title: geoInfo,
            map: gsogouMap,
            icon: pointicon        /*'../../../../image/S20.png'*/
        });
        //给每个marker设置侦听事件
        window.sogou.maps.event.addListener(marker, 'click', function() {
            var t=marker.getTitle();
            var index=Number(t.split(":")[0]);
            //测试使用
            gobj.gridOptions.api.ensureIndexVisible(index,'top');
            gobj.gridOptions.api.selectIndex(index,null,null);
        });
    }
    gsogouMap.setCenter(point);
}
//画线
var mapListenerFlag=true;
function drawLine(lonlats,polyOptions){
    if(mapListenerFlag){
        window.sogou.maps.event.addListener(gsogouMap,"click", function(){

        });
        mapListenerFlag=false;
    }

    var poly = new window.sogou.maps.Polyline(polyOptions);

    var strs= new Array();
    strs = lonlats.split(",");
    var point;
    for(var i = 0; i < strs.length; i = i + 2){
        point = new window.sogou.maps.Point(Number(strs[i]),Number(strs[i + 1]));
        var path = poly.getPath()||[];
        path.push(point);
        poly.setPath(path);
    }

    //给每个link设置点击侦听事件
    window.sogou.maps.event.addListener(poly, 'click', function() {
        var t=poly.getTitle();
        var index=Number(t.split(":")[0]);
        //测试使用
        gobj.gridOptions.api.ensureIndexVisible(index,'top');
        gobj.gridOptions.api.selectIndex(index,null,null);
    });

    gsogouMap.setCenter(point);
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
        map: gsogouMap
    });

    gsogouMap.setCenter(bound.getCenter());
}
//==================工具栏相关函数：end==========================================

