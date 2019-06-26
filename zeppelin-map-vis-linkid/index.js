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
$.fn.lSelectColor = function(options){
    var defaults = {
        containerId: 'lylColor',
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
        $('#' + settings.containerId).find('.laCol').click(function(){
            onSelect(this);
        });
    };
    var build = function(){
        var containerId = settings.containerId;
        var containerDiv = $('<div id="'+ containerId+'" class="lylColor" style="display: none"></div>');
        var defaultDiv = $('<div class="lylColor-default"></div>');
        var customDiv = $('<div class="lylColor-custom"></div>');
        var formatDiv = $('<div class="lylColor-format"></div>');

        defaultDiv.append('<span class="laCol" style="background-color: '+ settings.defaultColor +'" title="'+settings.defaultColor +'"></span>自动');
        var liHtml = '';
        $.each(settings.customColor,function(i,e){
            liHtml += '<li class="laCol" data-color="'+e+'" style="background-color: '+ e +'" title="'+ e +'"></li>';
        });
        customDiv.append('<div class="ltitle">主题颜色</div><ul>'+liHtml+'</ul>');

        liHtml = '';
        $.each(settings.formatColor,function(i,e){
            liHtml += '<li class="laCol" data-color="'+e+'" style="background-color: '+e+'" title="'+ e +'"></li>';
        });
        customDiv.append('<div class="ltitle">标准色</div><ul>'+liHtml+'</ul>');

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
var lobj=new Object();
//lobj.InitFlag=true;
var lmyagGrid;
export default class LSogouMapTable extends Visualization {
    constructor(targetEl, config) {
        super(targetEl, config);
        console.log('linkid start constructor called...');
        /*选择器相关*/
        const columnSpec = [
            { name: 'LinkId'},
            { name: 'Kind'},
            { name: 'MapTip'},
            { name: 'HeatMap-Val'}
        ];
        this.transformation = new ColumnselectorTransformation(config, columnSpec);//tab栏设

        //lobj.InitFlag=true;

        this.passthrough = new PassthroughTransformation(config);
        this.targetEl = targetEl[0];
        //修改表的布局
        this.targetEl.style="position:relative;height:100%;width:40%;float:left";
        this.targetEl.classList.add('ag-fresh');
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
        //表格文件的导出功能
        // var params = {
        //       skipHeader: true,
        //       columnGroups: true,
        //       skipFooters: true,
        //       skipGroups: true,
        //       skipPinnedTop: true,
        //       skipPinnedBottom: true,
        //       allColumns: true,
        //       onlySelected: true,
        //       suppressQuotes: true,
        //       fileName: 'export.csv'
        // };
        // this.gridOptions.api.exportDataAsCsv(params);
		lobj.config = this.transformation.config;
        //为表格设置点击事件
        this.gridOptions.onRowClicked=function(ev){
            //var xs=(ev.data.x+"").split(",");
            //var ys=(ev.data.y+"").split(",");
            //mySetCenter(xs[0],ys[0]);
            //var linkid=ev.data.id;
			var linkids = ev.data[lobj.config["LinkId"].name]
            var url ="http://10.142.90.171:18080/navi"+"/debug/querylinks?links=" + linkids + "&idv=1&callback=?";
            $.getJSON(url,function(data){
                if(typeof(data.err)!="undefined"&&data.err.length>0){
                    alert("Not found linkID!");
                }else{
                    var linkStyleObj=new Object();
                    linkStyleObj.strokeColor="black";
                    linkStyleObj.strokeWeight=8;
                    drawLinks(data, false, 0, linkStyleObj,"");
                }
            });
            console.log("linkid 表格行被单击了...");
        };

        this.destroyLayout();

        console.log('linkid end constructor called...'+'targetEl:');
    };

    //加载搜狗地图第三方api库
    loadapi(){
            console.log("linkid loadapi() called ...");
            var sogouMapID="lsogoumap"+this.targetEl.id;
            if(!$("#go2map")[0]){
                var scriptdom = document.createElement('script');
                scriptdom.id="go2map";
                scriptdom.src='http://api.go2map.com/maps/js/api_v2.5.1.js';
                scriptdom.onload=function(){
                    if(typeof(lsogouMap)=="undefined"||lsogouMap==null){
                        console.log("linkid onload() initSogouMap()...");
                        lsogouMap=initSogouMap(sogouMapID);
                    }
                    //initPara(infoArray);//这里面初始化参数的同时也初始化了地图
                }
                document.body.appendChild(scriptdom);
            }else{
                if(typeof(lsogouMap)=="undefined"||lsogouMap==null){
                    console.log("linkid initSogouMap()...exist go2map");
                    lsogouMap=initSogouMap(sogouMapID);
                }
            }
    }

    getTransformation() {
        console.log('linkid getTransformation() called...'+'passthrough:'+this.passthrough.toString());
        return this.transformation;///*列选择器相关*/this.passthrough
    };

    // setConfig(config) {
    //     console.log('setConfig(config) called...');
    //     this.transformation.setConfig(config);//为了列选择器增加的
    //     this.pivot.setConfig(config);
    // };

    type() {
        console.log('linkid type() called...');
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
        console.log("linkid可视化插件被选中...")
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
        console.log("linkid deactivate() called...");
        this._active = false;
        this.destroyLayout();
    }

    destroy() {
        // override this
        console.log("linkid destroy() called ...");
        this.destroyLayout();
    }

    render(data) {
        console.log('linkid rener(data) called...');//JSON.stringify(data)

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

        this.gridOptions.columnDefs = columnDefs;
        this.gridOptions.rowData = rowData;

        lobj.gridOptions=this.gridOptions;

        new agGrid.Grid(this.targetEl, this.gridOptions);
        this.createMapDataModel(data);

    };

    /*创建地图数据模型*/
    createMapDataModel(data){
        console.log("linkid createMapDataModel(data) called ...");
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
                console.log("linkid message: Please set " + fieldName + " in Settings");
            }
        };

        const config = this.getTransformation().config;
        const linkidIdx = getColumnIndex(config, 'LinkId');
        const kindIdx=getColumnIndex(config, 'Kind');
        const tipIdx=getColumnIndex(config, 'MapTip');
        const hmIdx=getColumnIndex(config, 'HeatMap-Val');

        if(typeof(lobj.kindIdx) == "undefined") {
            lobj.kindIdx=kindIdx;
        }
        if(typeof(lobj.hmIdx) == "undefined"){
            lobj.hmIdx=hmIdx;
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

        //展示页面图
        var lpointstyleID="#lpointstyle"+this.targetEl.id;
        var llinestyleID="#llinestyle"+this.targetEl.id;
        var lheatmapstyleID="#lheatmapstyle"+this.targetEl.id;
        $(lpointstyleID).hide();
        $(llinestyleID).show();
        $(lheatmapstyleID).hide();
        if(typeof(hmIdx)!="undefined") {//调出热力图
            $(lpointstyleID).hide();
            $(llinestyleID).hide();
            $(lheatmapstyleID).show();
        }
//==================绑定style的风格:start==============================================
        var pointStyleMap=new Map();
        var lineStyleMap=new Map();
        var hmMap=new Map();

        if(lobj.kindIdx!=kindIdx||lobj.hmIdx!=hmIdx){//更换Kind字段后，清空表中的内容
            pointStyleMap.clear();
            lineStyleMap.clear();
            hmMap.clear();
            lobj.kindIdx=kindIdx;
            lobj.hmIdx=hmIdx;
        }

        //左侧栏设置
        var lmaptableID="#lmaptable"+this.targetEl.id;
        var lptitleID="#lptitle"+this.targetEl.id;
        var lltitleID="#lltitle"+this.targetEl.id;
        var pointsetID="#pointset"+this.targetEl.id;
        var lpointkindID="#lpointkind"+this.targetEl.id;
        var pointiconID="#pointicon"+this.targetEl.id;
        if($(lpointstyleID).is(':visible')){
            $(lmaptableID).empty();
            if(!$(lptitleID)[0]){
                $(lmaptableID).append("<tr id='lptitle"+this.targetEl.id+"'><td>Kind</td><td>Icon</td></tr>");
                kindSet.forEach(function(element, sameElement, set){
                    var id="#ltrp"+element;
                    if(!$(id)[0]){
                        $(lmaptableID).append("<tr id='ltrp"+element+"'><td>"+element+"</td><td></td></tr>");
                    }else{
                        $(id).html("<td>"+element+"</td><td></td>");
                    }
                });
                kindSet.clear();
            }
            $(pointsetID).click(function(){
                var kindKey=$(lpointkindID).val()
                var pointStyle=new Object();
                pointStyle.icon=$(pointiconID).val();
                pointStyleMap.set(kindKey,pointStyle);
                pointStyleMap.forEach(function (value, key, map) {
                    var id="#ltrp"+key;
                    if(!$(id)[0]){
                        $(lmaptableID).append("<tr id='ltrp"+key+"'><td>"+key+"</td><td>"+value.icon+"</td></tr>");
                    }else{
                        $(id).html("<td>"+key+"</td><td>"+value.icon+"</td>");
                    }
                });
            });
        }else if($(llinestyleID).is(':visible')){
            $(lmaptableID).empty();
            //设置默认值
            if(!$(lltitleID)[0]){
                $(lmaptableID).append("<tr id='lltitle"+this.targetEl.id+"'><td>Kind</td><td>Color</td><td>Weight</td></tr>");
            }
            var ccindex=0;
            kindSet.forEach(function(element, sameElement, set){
                var id="#ltrl"+element;
                if(!$(id)[0]){
                    $(lmaptableID).append("<tr id='ltrl"+element+"'><td>"+element+"</td><td id='lcolor"+ccindex+"' class='lstrokecolor' style='background-color:"+colors[ccindex%colors.length]+"'></td><td><input id='in"+ccindex+"' class='strokeweight' type='text' style= 'position:relative;width:25px' value=4 placeholder='4'/></td></tr>");
                }else{
                    $(id).html("<td>"+element+"</td><td id='lcolor"+ccindex+"' class='lstrokecolor' style='background-color:"+colors[ccindex%colors.length]+"'></td><td><input id='in"+ccindex+"' class='strokeweight' type='text' style= 'position:relative;width:25px' value=4 placeholder='4'/></td>");
                }
                //同时将格式添加到lineStyleMap
                var InitLineStyle=new Object();
                InitLineStyle.strokeColor=$(id).children('td').eq(1).css("background-color");
                InitLineStyle.strokeWeight=$(id).find("input").val();
                lineStyleMap.set(element+"",InitLineStyle);
                //给每个input元素设置值改变出发的事件
                $(id).find("input").change(function(){
                    var key=$(id).attr("id").replace("ltrl","");
                    lineStyleMap.get(key).strokeWeight=$(id).find("input").val();
                });
                ccindex=ccindex+1;
            });
            kindSet.clear();

            //表格颜色点击事件
            $('#lylColor').remove();
            $('.lstrokecolor').lSelectColor({
                left: 220,
                onSelect: function(oCol,elem){
                    var color = $(oCol).attr('data-color');
                    var id="#"+elem.id;
                    $(id).css({'background-color':color});
                    var kindKey=elem.parentNode.id;
                    kindKey=kindKey.replace("ltrl","");
                    lineStyleMap.get(kindKey).strokeColor=color;
                }
            });
        }
//==================绑定style的风格:end================================================

//==================画point,line,bound的逻辑:start=========================================
        //画线
        var llineyesID="#llineyes"+this.targetEl.id;
        var clockID="#lclock"+this.targetEl.id;
        $(llineyesID).click(function(){
            if(typeof(linkidIdx)!="undefined"){
                //展示加载动画
                $(clockID).css("visibility","visible");
                $(clockID).css("overflow","visible");

                var colorindex=0;
                for(var i=0;i<data.rows.length;i++){
                        //根据linkid网络请求获得数据
                        var linkid=data.rows[i][linkidIdx];//获得linkid
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
                            queryLinksByLinkNavIDs(linkid,linkStyleObj,title);//传入对应一行的数据和风格style对象
                        }else {
                            queryLinksByLinkNavIDs(linkid,lineStyleMap.get(kindRows[i]+""),title);//传入对应一行的数据和风格style对象
                        }
                        colorindex=colorindex+1;
                    }
                    //关闭加载动画
                    setTimeout(function(){
                        $(clockID).css("visibility","hidden");
                        $(clockID).css("overflow","hidden");
                    },3000);
            }else{
                console.log("linkid Please bind the corresponding data!");
            }
        });
        var llinenoID="#llineno"+this.targetEl.id;
        $(llinenoID).click(function(){
            lsogouMap.clearAll();
        });

//==================画point,line,bound的逻辑:end===========================================

//==================画热力图逻辑:start=================================================
        var maxHMVal=0;
        for(var j=0;j<data.rows.length;j++){
            if(typeof(hmIdx)!="undefined"&&hmIdx!=null){
                if(data.rows[j][hmIdx]>maxHMVal){
                    maxHMVal=data.rows[j][hmIdx];
                }
            }
        }

        //热力图数据单独取

        if($(lheatmapstyleID).is(':visible')){
                $(lmaptableID).empty();
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

                $(lmaptableID).append("<tr id='lhmtitle'><td>Heat Level</td><td>Heat Scope</td></tr>");
                hmMap.forEach(function (value, key, map) {
                    var id=key;
                    $(lmaptableID).append("<tr><td style='background-color:"+key+"'></td><td>"+value+"</td></tr>");
                });
        }

        console.log("linkid hmPoints:...");

        //画热力图
        var lheatmapyesID="#lheatmapyes"+this.targetEl.id;
        $(lheatmapyesID).click(function () {
            console.log("热力图按钮被点击...");
            if(typeof(linkidIdx)!="undefined"&&typeof(hmIdx)!="undefined") {
                //展示加载动画
                $(clockID).css("visibility","visible");
                $(clockID).css("overflow","visible");

                //调用画热力图的函数
                for(var i=0;i<data.rows.length;i++){
                    var hcolor=null;
                    if(data.rows[i][hmIdx]<=(maxHMVal/5.0)){
                        //深蓝
                        hcolor='#0000FF';
                    }else if(data.rows[i][hmIdx]>(maxHMVal/5.0)&&data.rows[i][hmIdx]<=(maxHMVal*2.0/5.0)){
                        //浅蓝
                        hcolor='#2783e6';
                    }else if(data.rows[i][hmIdx]>(maxHMVal*2.0/5.0)&&data.rows[i][hmIdx]<=(maxHMVal*3.0/5.0)){
                        //绿
                        hcolor='#008000';
                    }else if(data.rows[i][hmIdx]>(maxHMVal*3.0/5.0)&&data.rows[i][hmIdx]<=(maxHMVal*4.0/5.0)){
                        //黄
                        hcolor='#FFFF00';
                    }else if(data.rows[i][hmIdx]>(maxHMVal*4.0/5.0)){
                        //红色
                        hcolor='#FF0000';
                    }
                    //根据linkid网络请求获得数据
                    var linkid=data.rows[i][linkidIdx];//获得linkid
                    var title;
                    if(typeof(tipIdx)!="undefined"){
                        title=i+":"+data.rows[i][tipIdx].name+":"+data.rows[i][tipIdx];
                    }else{
                        title=i+":please set tip!";
                    }
                    var lineStyleObj=new Object();
                    lineStyleObj.title=title;
                    lineStyleObj.strokeColor=hcolor;
                    lineStyleObj.strokeWeight=4;
                    queryLinksByLinkNavIDs(linkid,lineStyleObj,title);//传入对应一行的数据和风格style对象
                }
                //关闭加载动画
                setTimeout(function(){
                    $(clockID).css("visibility","hidden");
                    $(clockID).css("overflow","hidden");
                },3000);
            }else{
                console.log("linkid  Please bind the corresponding data!");
            }
        });
        var lheatmapnoID="#lheatmapno"+this.targetEl.id;
        $(lheatmapnoID).click(function () {
            lsogouMap.clearAll();
        });
//==================画热力图逻辑:end=================================================
    }

    initMapDiv(){
        console.log("linkid initMapDiv() called ...");
        //为了解决搜狗地图显示的bug添加的style
        var mapStyle=document.createElement('style');
        mapStyle.innerHTML="#lsogoumap"+this.targetEl.id+" img { max-width:none }";
        document.head.appendChild(mapStyle);

        //初始化搜狗地图
        var mapDiv=document.createElement('div');
        mapDiv.id="lsogoumap"+this.targetEl.id;
        mapDiv.style="position:relative;height:100%;width:50%;float:left;";
        //将搜狗地图的div添加到路线信息表的父节点中
        this.targetEl.parentNode.appendChild(mapDiv);
    }

    //初始化风格栏
    initStyeDiv(dom){
        console.log("linkid initStyeDiv() called ...");
        //初始化style
        var stypeStyle=document.createElement('style');
        stypeStyle.innerHTML="#lpopUp"+this.targetEl.id+"{\n" +
            "\t\t\tposition: absolute;\n" +
            "\t\t\tvisibility: hidden;\n" +
            "\t\t\toverflow: hidden;\n" +
            "\t\t\tbackground-color: white;\n" +
            "\t\t\tpadding:5px;\n" +
            "\t\t\tz-index: 99999;\n" +
            "\t\t\twidth:580px; height:340px; margin-top: 0px;\n" +
            "\t\t\tborder-color:black; border-width:4px\n" +
            "\t\t}\n" +
            "\t\t#ltableoutter"+this.targetEl.id+"{\n" +
            "\t\t\tposition:relative;  height:100%;  width:75%;  float:left;background-color: white;\n" +
            "\t\t\tborder-style:ridge;border-color:white; border-width:4px;text-align: center;\n" +
            "\t\t}\n" +
            "\t\t#ltableinner"+this.targetEl.id+"{\n" +
            "\t\t\tposition:relative;  height:95%;  width:95%;  float:left;background-color: rgba(0,255,0,0.2);\n" +
            "\t\t\tmargin-top: 2%;margin-left: 2%;overflow-y: scroll;\n" +
            "\t\t}\n" +
            "\t\t#lmaptable"+this.targetEl.id+"{\n" +
            "\t\t\tposition:relative;  height:90%;  width:95%;  float:left;background-color:white;\n" +
            "\t\t\tmargin-top: 4%;margin-left: 2%;\n" +
            "\t\t}\n" +
            "\n" +
            "\t\t#typestyle"+this.targetEl.id+"{\n" +
            "\t\t\tposition:relative;  height:100%;  width:20%;  float:left;text-align: center;\n" +
            "\t\t\tborder-style:ridge; border-color:rgba(0,0,0,0.4); border-width:4px;\n" +
            "\t\t}\n" +
            "\t\t.divtitle{\n" +
            "\t\t\tposition:relative;  height:8%;  width:100%; margin-top:4px; text-align: center;font-weight:bold;\n" +
            "\t\t}\n" +
            "\t\t.typetitle{\n" +
            "\t\t\tposition:relative;  height:5%;  width:100%; margin-top:4px; text-align: center;font-weight:bold;\n" +
            "\t\t}\n" +
            "\t\t.lpointstyle{\n" +
            "\t\t\tposition: relative;  height: 60%; width:98%; text-align: center;background-color: rgba(0,255,0,0.2);\n" +
            "\t\t}\n" +
            "\t\t.divstyle{\n" +
            "\t\t\tdisplay:none; position: relative;  height: 60%; width:98%; text-align: center;background-color: rgba(0,255,0,0.2);\n" +
            "\t\t}\n" +
            "\t\t.lylColor {\n" +
            "\t\t\tposition: absolute;\n" +
            "\t\t\tz-index: 99999;\n" +
            "\t\t\twidth: 250px;\n" +
            "\t\t\tbackground: #fff;\n" +
            "\t\t\tbox-shadow: 1px 1px 2px #c6d9f1, -1px -1px 2px #c6d9f1;\n" +
            "\t\t\tfont-size: 14px;\n" +
            "\t\t\tcolor: #000;\n" +
            "\t\t}\n" +
            "\t\t.lylColor .laCol {\n" +
            "\t\t\tdisplay: inline-block;\n" +
            "\t\t\tfloat: left;\n" +
            "\t\t\twidth: 15px;\n" +
            "\t\t\theight: 15px;\n" +
            "\t\t\tmargin: 0 7px 7px 0;\n" +
            "\t\t\tborder: 1px solid #eee;\n" +
            "\t\t\tcursor: pointer;\n" +
            "\t\t}\n" +
            "\t\t.lylColor .laCol:nth-child(10n) {\n" +
            "\t\t\tmargin-right: 0;\n" +
            "\t\t}\n" +
            "\t\t.lylColor-default {\n" +
            "\t\t\tpadding: 7px;\n" +
            "\t\t}\n" +
            "\t\t.lylColor-custom ul {\n" +
            "\t\t\toverflow: hidden;\n" +
            "\t\t\tpadding: 7px 7px 0;\n" +
            "\t\t}\n" +
            "\t\t.lylColor .ltitle {\n" +
            "\t\t\tpadding: 7px;\n" +
            "\t\t\tbackground-color: #f4f4f8;\n" +
            "\t\t}";
        document.head.appendChild(stypeStyle);

        //初始化div
        var styeDiv = document.createElement('div');
        styeDiv.id = "lpopUp"+this.targetEl.id;
        styeDiv.innerHTML="<div id=\"typestyle"+this.targetEl.id+"\" >\n" +
            "\t\t<span class=\"divtitle\" size=\"30px\">STYE</span><hr />\n" +
            "\t\t<div id=\"lpointstyle"+this.targetEl.id+"\" class=\"lpointstyle\">\n" +
            "\t\t\t<span class=\"typetitle\" size=\"18px\">PointStyle</span><hr/>\n" +
            "\t\t\tKind:<select id=\"lpointkind"+this.targetEl.id+"\" style=\"position:relative;width:80%;margin-top:4px\">\n" +
            "\n" +
            "\t\t</select><br/>\n" +
            "\t\t\tIcon:<select id=\"pointicon"+this.targetEl.id+"\" style=\"position:relative;width:80%;margin-top:4px\">\n" +
            "\t\t\t<option value=\"../../../../image/ball-green-16.png\">ball</option>\n" +
            "\t\t\t<option value=\"../../../../image/ping.png\">pin</option>\n" +
            "\t\t\t<option value=\"../../../../image/flag_red.png\">flag</option>\n" +
            "\t\t\t<option value=\"../../../../image/point.png\">point</option>\n" +
            "\t\t\t<option value=\"../../../../image/S20.png\">S20</option>\n" +
            "\t\t</select><br/>\n" +
            "\t\t\t<button id=\"pointset"+this.targetEl.id+"\" style=\"position:relative;margin-top:4px;width:80%;margin-bottom:10px;\">StyleSet</button>\n" +
            "\t\t\t<button id=\"pointyes"+this.targetEl.id+"\" style=\"position:relative;margin-top:4px;width:45%;margin-bottom:10px;\">Draw</button>\n" +
            "\t\t\t<button id=\"pointno"+this.targetEl.id+"\" style=\"position:relative;margin-top:4px;width:45%;margin-bottom:10px;\">Clear</button>\n" +
            "\t\t</div >\n" +
            "\t\t<div id=\"llinestyle"+this.targetEl.id+"\" class=\"divstyle\">\n" +
            "\t\t\t<span class=\"typetitle\" size=\"18px\">LineStyle</span><br/>\n" +
            "\t\t\t<button id=\"llineyes"+this.targetEl.id+"\" style=\"position:relative;margin-top:20px;width:80%\">Draw</button><br/>\n" +
            "\t\t\t<button id=\"llineno"+this.targetEl.id+"\" style=\"position:relative;margin-top:20px;width:80%\">Clear</button>\n" +
            "\t\t</div>\n" +
            "\t\t<div id=\"lheatmapstyle"+this.targetEl.id+"\" class=\"divstyle\">\n" +
            "\t\t\t<span class=\"typetitle\" size=\"18px\">HeatMapStyle</span><br/>\n" +
            "\t\t\t<button id=\"lheatmapyes"+this.targetEl.id+"\" style=\"position:relative;margin-top:30px;width:80%;\">Draw</button><br/>\n" +
            "\t\t\t<button id=\"lheatmapno"+this.targetEl.id+"\" style=\"position:relative;margin-top:30px;width:80%;\">Clear</button>\n" +
            "\t\t</div>\n" +
            "\t\t<button id=\"lhidePopup"+this.targetEl.id+"\" style=\"position:relative;width:60%;margin-top: 30px;\">Close</button>\n" +
            "\t</div>\n" +
            "\t<div id=\"ltableoutter"+this.targetEl.id+"\" >\n" +
            "\t\t<div id=\"ltableinner"+this.targetEl.id+"\">\n" +
            "\t\t\t<table id=\"lmaptable"+this.targetEl.id+"\" border=\"1\">\n" +
            "\t\t\t\t<!--<tr><td></td><td></td><td></td></tr>-->\n" +
            "\t\t\t</table>\n" +
            "\t\t</div>\n" +
            "\t</div>";
        this.targetEl.parentNode.appendChild(styeDiv);

        this.setStyeClick();
    }

    //初始化上面工具栏
    initToolDiv() {
        console.log("linkid initToolDiv()方法被调用，初始化工具栏...");

        var toolStyle = document.createElement('style');
        toolStyle.innerHTML = "#linkidtool"+this.targetEl.id+"{\n" +
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
        toolDiv.id = "linkidtool"+this.targetEl.id;
        toolDiv.innerHTML = "<span size=\"18px\" class=\"tooltitle\">Tools</span>\n" +
            "\t\t<div id=\"div1"+this.targetEl.id+"\" class=\"tooldivfirst\" >\n" +
            "\t\t  <button id=\"drawpoint"+this.targetEl.id+"\" class=\"toolbu\" >DrawPoint</button>\n" +
            "\t\t  <div id=\"drawpointdiv"+this.targetEl.id+"\" class=\"budiv\">\n" +
            "\t\t\t<span >Ponits(x1,y1,x2,y2,...):</span>\n" +
            "\t\t\t<input id=\"point"+this.targetEl.id+"\" class=\"divinput\" style=\"\"/><br/>\n" +
            "\t\t\t  Icon:<select id=\"toolpointicon"+this.targetEl.id+"\" style=\"position:relative;width:80%;margin-top:4px\">\n" +
            "\t\t\t  <option value=\"../../../../image/ball-green-16.png\">ball</option>\n" +
            "\t\t\t  <option value=\"../../../../image/ping.png\">pin</option>\n" +
            "\t\t\t  <option value=\"../../../../image/flag_red.png\">flag</option>\n" +
            "\t\t\t  <option value=\"../../../../image/point.png\">point</option>\n" +
            "\t\t\t  <option value=\"../../../../image/S20.png\">S20</option>\n" +
            "\t\t  </select><br/>\n" +
            "\t\t\t<span id=\"checkdrawpoint"+this.targetEl.id+"\" style=\"display:none;position:relative;color:red\"></span><br/>\n" +
            "\t\t\t<button id=\"drawpointsure"+this.targetEl.id+"\" style=\"position:relative;margin-top:0px;width:45%;margin-bottom:10px;\">Draw</button>\n" +
            "\t\t\t<button id=\"clearpoint"+this.targetEl.id+"\" style=\"position:relative;margin-top:0px;width:45%;margin-bottom:10px;\">Clear</button>\n" +
            "\t\t  </div>\n" +
            "\t    </div >\n" +
            "\t    <div id=\"div2"+this.targetEl.id+"\" class=\"tooldivother\">\n" +
            "\t\t  <button id=\"drawlink"+this.targetEl.id+"\" class=\"toolbu\">DrawLink</button>\n" +
            "\t\t  <div id=\"drawlinkdiv"+this.targetEl.id+"\" class=\"budiv\">\n" +
            "\t\t\t  <span >Line(x1,y1,x2,y2,...):</span><br/>\n" +
            "\t\t\t  <input id=\"line"+this.targetEl.id+"\" style=\"position:relative;width:80%;margin-top:4px\"/><br/>\n" +
            "\t\t\t  LineColor:<select id=\"linecolor"+this.targetEl.id+"\" style=\"position:relative;width:80%;margin-top:4px;\">\n" +
            "\t\t\t\t\t\t<option value='red'>red</option>\n" +
            "\t\t\t\t\t\t<option value='blue'>blue</option>\n" +
            "\t\t\t\t\t\t<option value='green'>green</option>\n" +
            "\t\t\t  </select><br/>\n" +
            "\t\t\t  LineWeight:<select id=\"lineweight"+this.targetEl.id+"\" style=\"position:relative;width:80%;margin-top:4px;\">\n" +
            "\t\t\t\t  <option value=1 >1</option>\n" +
            "\t\t\t\t  <option value=4 >4</option>\n" +
            "\t\t\t\t  <option value=8 >8</option>\n" +
            "\t\t\t  </select><br/>\n" +
            "\t\t\t<span id=\"checkdrawline"+this.targetEl.id+"\" style=\"display:none;position:relative;color:red\"></span><br/>\n" +
            "\t\t\t<button id=\"drawlinesure"+this.targetEl.id+"\" style=\"position:relative;margin-top:4px;margin-bottom:10px;width:45%\">Draw</button>\n" +
            "\t\t\t<button id=\"clearline"+this.targetEl.id+"\" style=\"position:relative;margin-top:4px;margin-bottom:10px;width:45%\">Clear</button>\n" +
            "\t\t  </div>\n" +
            "\t    </div>\n" +
            "\t    <div id=\"div3"+this.targetEl.id+"\" class=\"tooldivother\">\n" +
            "\t\t    <button id=\"drawgeo"+this.targetEl.id+"\" class=\"toolbu\">DrawGeo</button>\n" +
            "\t\t    <div id=\"drawgeodiv"+this.targetEl.id+"\" class=\"budiv\">\n" +
            "\t\t\t\t<span >Geo(x1,y1,x2,y2,...):</span><br/>\n" +
            "\t\t\t\t<input id=\"geo"+this.targetEl.id+"\" style=\"position:relative;width:80%;margin-top:4px\"/><br/>\n" +
            "\t\t\t\tStrokeColor: <select id=\"geocolor"+this.targetEl.id+"\" style=\"position:relative;width:80%;margin-top:4px;\">\n" +
            "\t\t\t\t\t<option value='red'>red</option>\n" +
            "\t\t\t\t\t<option value='blue'>blue</option>\n" +
            "\t\t\t\t\t<option value='green'>green</option>\n" +
            "\t\t\t\t</select><br/>\n" +
            "\t\t\t\tStrokeOpacity: <select id=\"geoopacity"+this.targetEl.id+"\" style=\"position:relative;width:80%;margin-top:4px;\">\n" +
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
            "\t\t\t\tstrokeWeight: <select id=\"geoweight"+this.targetEl.id+"\" style=\"position:relative;width:80%;margin-top:4px;\">\n" +
            "\t\t\t\t\t<option value=1>1</option>\n" +
            "\t\t\t\t\t<option value=5>5</option>\n" +
            "\t\t\t\t\t<option value=10>10</option>\n" +
            "\t\t\t\t</select><br/>\n" +
            "\t\t\t\t<span id=\"checkdrawgeo"+this.targetEl.id+"\" style=\"display:none;position:relative;color:red\"></span><br/>\n" +
            "\t\t\t\t<button id=\"drawgeosure"+this.targetEl.id+"\" style=\"position:relative;margin-top:4px;width:45%;margin-bottom:10px;\">Draw</button>\n" +
            "\t\t\t\t<button id=\"cleargeo"+this.targetEl.id+"\" style=\"position:relative;margin-top:4px;width:45%;margin-bottom:10px;\">Clear</button>\n" +
            "\t\t\t</div>\n" +
            "\t    </div>\n" +
            "\t    <div  id=\"div6"+this.targetEl.id+"\"class=\"tooldivlast\">\n" +
            "\t\t\t<button id=\"lshowPopup"+this.targetEl.id+"\" style=\"position:relative;width:80%;margin-top: 10px\">Draw</button>\n" +
            "\t    </div>";
        this.targetEl.parentNode.appendChild(toolDiv);

        this.setToolClick();
    }

    initLayout(){
        var styeID="#lpopUp"+this.targetEl.id;
        var mapID="#lsogoumap"+this.targetEl.id;
        var toolID="#linkidtool"+this.targetEl.id;
        if(!$(styeID)[0]){
            this.initStyeDiv();
        }
        if(!$(mapID)[0]){
            this.initMapDiv();//创建地图的div
        }
        if(!$(toolID)[0]){
            this.initToolDiv();
        }

        var clockID="#lclock"+this.targetEl.id;
        if(!$(clockID)[0]) {
            this.initTimeClock();
        }

        if($(mapID)[0]){
            console.log("linkid 显示sogoumap div...");
            $(mapID).show();
            $(mapID).css('display','block');
        }
        if($(toolID)[0]){
            $(toolID).show();
            $(toolID).css('display','block');
            console.log("linkid 显示tool div...");
        }
        var sogouMapID="lsogoumap"+this.targetEl.id;
        if((typeof(lsogouMap)=="undefined"&&($("#go2map")[0]))||(lsogouMap==null&&($("#go2map")[0]))){
            console.log("linkid activate initsogoumap()...");
            lsogouMap=initSogouMap(sogouMapID);//激活的时候也初始化地图
        }
    }

    destroyLayout(){
        var styeID="#lpopUp"+this.targetEl.id;
        var mapID="#lsogoumap"+this.targetEl.id;
        var toolID="#linkidtool"+this.targetEl.id;
        //清空表div的子元素
        var tableID="#"+this.targetEl.id;
        $(tableID).empty();
        if($(mapID)[0]){
            console.log("linkid 隐藏sogoumap div...");
            $(mapID).hide();
        }
        if($(toolID)[0]){
            $(toolID).hide();
            console.log("linkid 隐藏tool div...");
        }
        $(styeID).css("visibility","hidden");
        $(styeID).css("overflow","hidden");


        $(mapID).remove();
        $(toolID).remove();
        $(styeID).remove();
        var clockID="#lclock"+this.targetEl.id;
        $(clockID).remove();

        lsogouMap=null;
        //lmyagGrid=null;

    }

    setStyeClick(){
        var styeID="#lpopUp"+this.targetEl.id;
        var lhidePopupID="#lhidePopup"+this.targetEl.id;
        $(lhidePopupID).click(function(){
            $(styeID).css("visibility","hidden");
            $(styeID).css("overflow","hidden");
        });
    }

    setToolClick(){
        var styeID="#lpopUp"+this.targetEl.id;
        var lshowPopupID="#lshowPopup"+this.targetEl.id;
        $(lshowPopupID).click(function(){
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
        var drawpointID="#drawpoint"+this.targetEl.id;
        var drawpointdivID="#drawpointdiv"+this.targetEl.id;
        var div1ID="#div1"+this.targetEl.id;
        var div2ID="#div2"+this.targetEl.id;
        var div3ID="#div3"+this.targetEl.id;
        var div4ID="#div4"+this.targetEl.id;
        var div5ID="#div5"+this.targetEl.id;
        var div6ID="#div6"+this.targetEl.id;
        $(drawpointID).click(function () {
            $(drawpointdivID).toggle();
            $(div2ID).toggle();
            $(div3ID).toggle();
            $(div4ID).toggle();
            $(div5ID).toggle();
            $(div6ID).toggle();
            $(lshowPopupID).toggle();
        });
        var drawlinkID="#drawlink"+this.targetEl.id;
        var drawlinkdivID="#drawlinkdiv"+this.targetEl.id;
        $(drawlinkID).click(function () {
            $(drawlinkdivID).toggle();
            $(div1ID).toggle();
            $(div3ID).toggle();
            $(div4ID).toggle();
            $(div5ID).toggle();
            $(div6ID).toggle();
            $(lshowPopupID).toggle();
        });
        var drawgeoID="#drawgeo"+this.targetEl.id;
        var drawgeodivID="#drawgeodiv"+this.targetEl.id;
        $(drawgeoID).click(function () {
            $(drawgeodivID).toggle();
            $(div1ID).toggle();
            $(div2ID).toggle();
            $(div4ID).toggle();
            $(div5ID).toggle();
            $(div6ID).toggle();
            $(lshowPopupID).toggle();
        });
//==============工具栏点击逻辑：end=================================================

//==============画点、画线：start======================================================
        var drawpointsureID="#drawpointsure"+this.targetEl.id;
        var pointID="#point"+this.targetEl.id;
        var checkdrawpointID="#checkdrawpoint"+this.targetEl.id;
        var toolpointiconID="#toolpointicon"+this.targetEl.id;
        $(drawpointsureID).click(function () {
            if (!$(pointID).val()) {
                $(checkdrawpointID).show();
                $(checkdrawpointID).text("*Please set the values of X and Y!");
            } else {
                $(checkdrawpointID).hide();
                drawMarkers($(pointID).val(),$(toolpointiconID).val(),"");
            }
        });
        var clearpointID="#clearpoint"+this.targetEl.id;
        $(clearpointID).click(function () {
            lsogouMap.clearAll();
        });
        //画线
        var drawlinesureID="#drawlinesure"+this.targetEl.id;
        var lineID="#line"+this.targetEl.id;
        var checkdrawlineID="#checkdrawline"+this.targetEl.id;
        var linecolorID="#linecolor"+this.targetEl.id;
        var lineweightID="#lineweight"+this.targetEl.id;
        $(drawlinesureID).click(function () {
            if (!$(lineID).val()) {
                $(checkdrawlineID).show();
                $(checkdrawlineID).text("*Please enter the correct link coordinate value!");
            } else {
                $(checkdrawlineID).hide();
                var polyOptions = {
                    strokeColor: $(linecolorID).val(), /*'#FF4500'*/
                    strokeOpacity: 1.0,
                    strokeWeight: $(lineweightID).val()
                }
                drawLine($(lineID).val(), polyOptions);
            }
        });
        var clearlineID="#clearline"+this.targetEl.id;
        $(clearlineID).click(function () {
            lsogouMap.clearAll();
        });
//==============画点、画线：end======================================================

//==============画geo：start======================================================
        var drawgeosureID="#drawgeosure"+this.targetEl.id;
        var geoID="#geo"+this.targetEl.id;
        var checkdrawgeoID="#checkdrawgeo"+this.targetEl.id;
        var geocolorID="#geocolor"+this.targetEl.id;
        var geoopacityID="#geoopacity"+this.targetEl.id;
        var geoweightID="#geoweight"+this.targetEl.id;
        $(drawgeosureID).click(function () {
            if (!$(geoID).val()) {
                $(checkdrawgeoID).show();
                $(checkdrawgeoID).text("*Please enter the correct geo coordinate value!");
            } else {
                $(checkdrawgeoID).hide();
                drawBound($(geoID).val(),"", $(geocolorID).val(), $(geoopacityID).val(), $(geoweightID).val());
            }
        });
        var cleargeoID="#cleargeo"+this.targetEl.id;
        $(cleargeoID).click(function () {
            lsogouMap.clearAll();
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
        clockDiv.id = "lclock"+this.targetEl.id;
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
var lsogouMap;
var table;
var colors = ["#00FFFF", "#0000FF", "#00FF00", "#8A2BE2",  "#FFFF00", "#A52A2A", "#FF0000", "#DEB887", "#8B0000", "#5F9EA0","#D2691E","#6495ED","#008B8B","#B8860B","#006400"];
var selectColor = "#000000"
var colorIndex = 0;
var mapGeomArray = new Array();
var selectGeomIndex = -1;
var heatmapInstance;
//var agGridVar;
//========搜狗地图画图相关变量（如图的颜色等）：end=====================================
function initSogouMap(sogouMapID){
    // if(lobj.InitFlag) {
    //     lobj.InitFlag = false;
        console.log("linkid initSogouMap() called...");
        var myLatlng = new window.sogou.maps.LatLng(39.992792, 116.326142);
        var myOptions = {
            zoom: 9,
            center: myLatlng,
            mapTypeId: window.sogou.maps.MapTypeId.ROADMAP
        }
        var lsogouMap = new window.sogou.maps.Map(document.getElementById(sogouMapID), myOptions);
        return lsogouMap;
    //}
}

function mySetCenter(x,y){
    var point = new window.sogou.maps.Point(Number(x),Number(y));
    lsogouMap.setCenter(point);
}

//搜狗地图上画点
function drawPoint(point){
    var icon = '../../../../image/pin.png';//这里图片目录需要修改
    console.log("linkid 画点函数中的图标为："+icon+"=="+JSON.stringify(icon)+"此时的sogouMap对象："+lsogouMap);
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
        map: lsogouMap,
    });
}
//搜狗地图上画线
function drawLink(link) {
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
        map: lsogouMap
    });
}
//========初始化搜狗地图:end==========================================================

//========画热力图函数:start==========================================================
function drawHeatMap(points,circleradius){
    console.log("linkid drawHeatMap(mapParas)函数被调用...");
    //引入heatmap.js库
    if(!$("#heatmapjs")[0]){
        console.log("开始添加heatmap.js相关依赖...");
        var scriptDom=document.createElement('script');
        scriptDom.id="heatmapjs";
        scriptDom.src="https://cdn.bootcss.com/heatmap.js/2.0.2/heatmap.min.js";
        document.head.appendChild(scriptDom);

        scriptDom.onload=function(){
            callHeatMapAPI(points,circleradius);
        }
    }else{
        callHeatMapAPI(points,circleradius);
    }

}
function callHeatMapAPI(points,circleradius){
    console.log("linkid 开始画热力图...");
    //热力图提示相关
    var mapContainer=document.querySelector('#lsogoumap');
    heatmapInstance = h337.create({
        container: mapContainer,
        radius: circleradius,//设置热力图光圈半径大小 [0,+∞]
        onExtremaChange: function onExtremaChange(data) {
            updateLegend(data);
        }
    });

    /* tooltip code start */
    var tooltip = document.querySelector('#tooltip');
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
    // var points = [];
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
    //     points.push(point);
    // }
    //--------------------------------------------------------------------
    var datas = {
        max: max,
        data: points
    };
    heatmapInstance.addData(datas);
}
function updateLegend(data) {
    // the onExtremaChange callback gives us min, max, and the gradientConfig
    // so we can update the legend
    $('#min').text(data.min);
    $('#max').text(data.max);
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
function drawMarkers(lonlats,pointicon,geoInfo){
    var strs= new Array();
    strs = lonlats.split(",");
    var point;
    for(var i = 0; i < strs.length; i = i + 2){
        point = new window.sogou.maps.Point(Number(strs[i]),Number(strs[i + 1]));

        var marker = new window.sogou.maps.Marker({
            position: point,
            title: geoInfo,
            map: lsogouMap,
            icon: pointicon        /*'../../../../image/S20.png'*/
        });
    }
    lsogouMap.setCenter(point);
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
    poly.setMap(lsogouMap);

    var strs= new Array();
    strs = lonlats.split(",");
    var point;
    for(var i = 0; i < strs.length; i = i + 2){
        point = new window.sogou.maps.Point(Number(strs[i]),Number(strs[i + 1]));
        var path = poly.getPath()||[];
        path.push(point);
        poly.setPath(path);
    }
    lsogouMap.setCenter(point);
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
        map: lsogouMap
    });

    lsogouMap.setCenter(bound.getCenter());
}
//==================工具栏相关函数：end==========================================

//==================通过linkID画图相关:start=====================================
var server = "link的服务器地址";
//通过linkId网络请求获得数据
function queryLinksByLinkNavIDs(links,linkStyleObj,title){
    var url = server + "/debug/querylinks?links=" + links + "&idv=1&callback=?";
    $.getJSON(url,function(res){
        drawLinks(res, false, 0, linkStyleObj,title);
    });
}
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
            map:lsogouMap
        });

        //给每个link设置点击侦听事件
        window.sogou.maps.event.addListener(line, 'click', function() {
            var t=line.getTitle();
            var index=Number(t.split(":")[0]);
            //测试使用
            lobj.gridOptions.api.ensureIndexVisible(index,'top');
            lobj.gridOptions.api.selectIndex(index,null,null);
        });

    });
    lsogouMap.setCenter(startPoint);
}
//==================通过linkID画图相关:end=======================================