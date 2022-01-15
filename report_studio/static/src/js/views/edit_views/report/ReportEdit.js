odoo.define('report_studio.ReportEdit', function (require) {
"use strict";

    var core = require('web.core');
    var Base = require('report_studio.BaseEdit');
    var ReportContent = require('report_studio.ReportContent');
    var ReportProperty = require('report_studio.ReportProperty');
    var utils = require('web.utils');
    var Widget = require('web.Widget');
    var ModelFieldSelector = require("web.ModelFieldSelector");
    var FieldBasic = require("report_studio.FieldBasic");
    var Wysiwyg = require('web_editor.wysiwyg.root');

    var QWeb = core.qweb;


    var ChooseField = Widget.extend({
        template: "ReportEdit.ChooseField",
        init: function (parent, props) {
            this._super(parent, props);
            this.props = props;
        },
        onSave: function () {
            const {onSave, hideField, hideName, multiple} = this.props, data = {};
            if ((multiple || []).length) {
                Object.keys(this.fmInstance).map((insName) => {
                    let chain = this.fmInstance[insName].fieldSelector.chain;
                    if (chain.length) {
                        data[insName] = {columnField: chain};
                    }
                })
            }else {
                if (!hideField) {
                    data.columnField = this.fmInstance.default.fieldSelector.chain;
                }
                if (!hideName) {
                    data.columnName = this.$el.find(".fStr input").val();
                }
            }
            onSave(data);
        },
        onCancel: function () {
            const {onCancel} = this.props;
            this.$el.remove();
            if (onCancel) {
                onCancel();
            }
        },
        bindAction: function () {
            this.$el.find(".btnSave").click(this.onSave.bind(this));
            this.$el.find(".btnCancel").click(this.onCancel.bind(this));
        },
        _renderFieldSelector: async function (sub) {
            const {dataRoot, chain, options} = this.props;
            let selectFieldModel = new FieldBasic.SelectFieldModel(this,
                {chain: chain || [], dataRoot: dataRoot, modelName: null, label: sub.label, options: options || {}});
            selectFieldModel.renderElement();
            let subEl = $(QWeb.render("ChooseField.Sub", sub));
            subEl.find('.slFCon').append(selectFieldModel.$el)
            this.$el.find(".slCon").append(subEl);
            this.fmInstance[sub.name] = selectFieldModel;
            return selectFieldModel;
        },
        renderFieldSelector: function () {
            const {hideField, multiple} = this.props;
            this.fmInstance = {};
            if (!(multiple || []).length) {
                if (!hideField) {
                    this._renderFieldSelector({label: "Field", name: "default"});
                }
            }else {
                multiple.map((sub) => {
                    this._renderFieldSelector(sub);
                });
            }
        },
        renderElement: function () {
            this._super();
            this.renderFieldSelector();
            this.bindAction();
        }
    });

    var ReportEdit = Base.EditBase.extend({
        assetLibs: ['web_editor.compiled_assets_wysiwyg'],
        start: function () {
            this._super();
            this.sortData = [];
            this.view.property = ReportProperty;
            this.view.content = ReportContent;
            this.templates = {};
            this.nodes = {};
        },
        appendElVirtual: function (el, tagName="div", elClass=[], position=null) {
            elClass = elClass.concat(["elVirtualEdit"]).join(" ");
            const path = this.getPathXpath(el), viewId = el.attr("data-oe-id"),
                before = $(`<${tagName} class='${elClass}'>`).attr({will_xpath: path, view_id: viewId}),
                after = $(`<${tagName} class='${elClass}'>`).attr({will_xpath: path, view_id: viewId});
            if (!position) {
                el.before(before).after(after);
            }else if (position == "before") {
                el.before(before);
            }else if (position == "after") {
                el.after(after);
            }else if (position == "append") {
                el.append(before);
            }
        },
        removeHelper: function () {
            $("main").find(".elVirtualEdit, .vtFieldLabel").remove();
            $("._wComItem a[move='true']").removeAttr("move");
        },
        getInlineSortData: function () {
            let listEl = [], el = this.ref.content.$el;
            this.removeHelper();
            el.find("span").each((idx, span) => {
                let $span = $(span), display = $span.css("display");
                if (display && display.indexOf("inline") >= 0) {
                    listEl.push($span);
                }
            });
            listEl.map((span) => {
                this.appendElVirtual(span);
            });
        },
        getInCellSortData: function () {
            let el = this.ref.content.$el;
            this.removeHelper();
            el.find("td, th").each((idx, td) => {
                $(td)["children"]().each((_idx, child) => {
                    this.appendElVirtual($(child));
                });
            });
        },
        getColumnsSortData: function () {
            let el = this.ref.content.$el, elPage = $(el.find(".page"));
            this.removeHelper();
            if (elPage["children"]().length <= 1) {
                this.appendElVirtual(elPage, "div", ["row columnsSort"], "append");
            }
            el.find("main, .page:not('.noChild')").children().each((idx, child) => {
                this.appendElVirtual($(child), "div", ["row columnsSort"], "before");
            });
            this.appendElVirtual(el.find("main").children().last(), "div", ["row columnsSort"], "after");
            this.appendElVirtual(el.find(".page:not('.noChild')").children().last(), "div", ["row columnsSort"], "after");
        },
        getFieldColumnSortData: function () {
            this.removeHelper();
            let el = this.ref.content.$el;
            el.find("td, th").each((idx, tag) => {
                const tagName = tag.tagName;
                this.appendElVirtual($(tag), tagName, ["fcSort"], "before");
            });
            el.find("tr").each((idx, tr) => {
                let child = $(tr)["children"](), lastChild = child[child.length-1], tagName = lastChild.tagName;
                this.appendElVirtual($(lastChild), tagName, ["fcSort"], "after");
            });
        },
        getBlockSortData: function () {
            let el = this.ref.content.$el, elPage = $(el.find(".page"));
            this.removeHelper();
            if (elPage["children"]().length <= 1) {
                this.appendElVirtual(elPage, "div", ["row columnsSort"], "append");
            }
            el.find(".page:not('.noChild')").children().each((idx, tag) => {
                this.appendElVirtual($(tag), "div", ["row blockSort"], "before");
            });
            this.appendElVirtual(el.find(".page:not('.noChild')").children().last(), "div", ["row blockSort"], "after");
        },
        getFieldLabelSortData: function () {
            this.removeHelper();
            let el = this.ref.content.$el, elPage = $(el.find(".page")), addVirtual = (elFound, position) => {
                const path = this.getPathXpath(elFound), viewId = elFound.attr("data-oe-id");
                let elVirtual = $(QWeb.render("ReportEdit.Block.VirtualFieldLabel", {}));
                elVirtual.addClass("vtFieldLabel").find(".col-3").attr({will_xpath: path, view_id: viewId}).addClass("elVirtualEdit");
                if (position == "append") {
                    elFound.append(elVirtual);
                }else if (position == "after") {
                    elFound.after(elVirtual);
                }else {
                    elFound.before(elVirtual);
                }
            };
            if (elPage["children"]().length <= 1) {
                addVirtual(elPage, "append");
            }
            el.find(".page:not(.noChild)").children().each((idx, elFound) => {
                addVirtual($(elFound));
            });
            addVirtual(el.find(".page:not('.noChild')").children().last(), "after");
            el.find(".row:not(.vtFieldLabel)").find(".col-3").each((idx, elFound) => {
                elFound = $(elFound);
                if (!elFound["children"]().length) {
                    const path = this.getPathXpath(elFound), viewId = elFound.attr("data-oe-id"),
                        elVirtual = $("<div class='flSort elVirtualEdit'></div>");
                    elVirtual.attr({will_xpath: path, view_id: viewId});
                    elFound.append(elVirtual);
                }
            });
        },
        getSubtotalData: function () {
            this.removeHelper();
            let el = this.ref.content.$el, elPage = el.find(".page"), childS = el.find(".page").children(),
            addVirtual = (elFound, position=null) => {
                const path = this.getPathXpath(elFound), viewId = elFound.attr("data-oe-id");
                let elVirtual = $(QWeb.render("ReportEdit.VirtualSubTotal", {}));
                elVirtual.addClass("vtFieldLabel").find(".col-md-5").attr({will_xpath: path, view_id: viewId}).addClass("elVirtualEdit blockSubtotal");
                if (position == "append") {
                    elFound.append(elVirtual);
                }else if (position == "after") {
                    elFound.after(elVirtual);
                }else {
                    elFound.before(elVirtual);
                }
            };
            if (childS.length <= 1) {
                addVirtual(elPage, "append");
            }
            childS.each((idx, elFound) => {
                addVirtual($(elFound));
            });
            addVirtual(childS.last(), "after");
        },
        onHoverComponents: function (e) {
            const target = $(e.currentTarget), mouseType = e.handleObj.type, comType = target.parent().attr("name"),
                virtualEdit = $(".elVirtualEdit"), moving = target.parents("._wSortable").find("[move='true']").length ? true : false;
            if ((mouseType == "mouse_over".replace("_", "") && !moving) || !virtualEdit.length) {
                if (["field_column"].includes(comType)) {
                    this.getFieldColumnSortData();
                }else if (["text_inline", "field_inline"].includes(comType)) {
                    this.getInlineSortData();
                } else if (["two_columns", "three_columns"].includes(comType)) {
                    this.getColumnsSortData();
                }else if (["text_in_cell", "field_in_cell"].includes(comType)) {
                    this.getInCellSortData();
                }else if (["text_block", "field_block", "title_block", "image", "table"].includes(comType)) {
                    this.getBlockSortData();
                }else if (["field_label"].includes(comType)) {
                    this.getFieldLabelSortData();
                }else if (["sub_total"].includes(comType)) {
                    this.getSubtotalData();
                }
                this.sortData = [[`._wComItem[name='${comType}'], .elVirtualEdit`, `._wComItem[name='${comType}'], .elVirtualEdit`]];
                this.bindSortable($("._wrapEditCon"));
            }else if (mouseType == "mouse_out".replace("_", "") && !moving){
                this.removeHelper();
            }else if (mouseType == "mouse_down".replace("_", "")) {
                target.attr({move: true});
            }else if (mouseType == "mouse_up".replace("_", "")) {
                this.removeHelper();
            }
        },
        beforeApplySort: function (el) {},
        findNodeByPath: function (xmlId, path) {
            return this.getPdfTemplate(xmlId).then((template) => {
                let nodes = template.evaluate(path, template, null, XPathResult.ANY_TYPE, null);
                return nodes.iterateNext();
            });
        },
        checkFieldWidget: function (el) {
            let fieldWidget = el.parents("[field-ok][options-values]");
            return fieldWidget;
        },
        setElActive: function (el) {
            if (this.elActive) {
                this.elActive.removeClass("elActive");
            }
            this.elActive = el;
            this.elActive.addClass("elActive");
            this.ref.property.setElActive(el);
        },
        getElActive: function (el) {
            let path = el.attr("data-oe-xpath") || el.attr("path-xpath"), xmlId = el.attr("data-oe-id"),
                fieldWidget = this.checkFieldWidget(el);
            if (fieldWidget.length) {
                path = fieldWidget.attr("data-oe-xpath") || fieldWidget.attr("path-xpath");
                xmlId = fieldWidget.attr("data-oe-id");
                el = fieldWidget;
            }
            return {xmlId: xmlId, path: path, elActive: el};
        },
        setNodeActive: function (node, willRender=true) {
            this.nodeActive = node;
            this.ref.property.setNodeActive(node, willRender);
        },
        getNodeFromEl: function (el, func) {
            let {xmlId, path, elActive} = this.getElActive(el);
            this.xmlActive = xmlId;
            this.setElActive(elActive);
            this.findNodeByPath(xmlId, path).then((node) => {
                func(node);
            });
        },
        onClickNode: function (el, willRender=true) {
            let self = this;
            this.getNodeFromEl(el, (node) => {
                self.setNodeActive(node, willRender);
            });
        },
        onReportToDom: function () {
            if (this.elActive) {
                const self = this, {path} = this.getElActive(this.elActive);
                if (path) {
                    let elActive = this.$el.find(`[data-oe-xpath="${path}"], [path-xpath="${[path]}"]`);
                    if (elActive.length) {
                        this.getNodeFromEl(elActive, (node) => {
                            self.setNodeActive(node, false);
                            self.ref.property.onReportReload();
                        });
                    }
                }
            }
        },
        getFieldWidget: function () {
            return this['_rpc']({
                model: 'odo.studio.report',
                method: 'get_field_widget',
                args: [],
                kwargs: {},
            });
        },
        getRandom: function () {
            return String(Math.random()).replace("0.", "RP");
        },
        onCreateTemplate: function (template, onComplete) {
            const {model} = $.bbq.getState(true), name = `${model.replaceAll(".", "_")}_${this.getRandom().substr(0, 10)}`,
                xml_id = `report_studio.${name}`, values = {xml: template, xml_id: xml_id, name: name, model: model};
            values.string = name.split("_").concat(["Report"]).map((str) => str.indexOf("RP") >= 0 ? "" : this.capitalizeFirstLetter(str)).join(" ");
            values.module = "report_studio";
            values.report_xml_id = `report_studio.action_${name}`;
            values.report_file = xml_id;
            values.report_name = xml_id;
            return this['_rpc']({
                model: 'odo.studio.report',
                method: 'create_new_report',
                args: [values],
                kwargs: {},
            }).then((data) => {
                onComplete(data);
            });
        },
        saveTemplate: function () {
            let self = this, reportData = this.ref.content.reportData, data = {templates: {}, reportId: reportData.id};
            Object.keys(this.templates).map((templateId) => {
                let template = this.templates[templateId];
                data.templates[templateId] = new XMLSerializer().serializeToString(template.documentElement);
            });
            return this['_rpc']({
                model: 'odo.studio.report',
                method: 'store_view',
                args: [data],
                kwargs: {},
            }).then(() => {
                self.ref.content.reloadReport();
                // self.ref.property.onSaveTemplate();
            });
        },
        saveReportProps: function (data) {
            return this['_rpc']({
                model: 'odo.studio.report',
                method: 'change_report_props',
                args: [data],
                kwargs: {},
            }).then(() => {
            });
        },
        getPdfTemplate: function (templateId) {
            let self = this, def = $.Deferred(), {id} = this.ref.content.reportData;
            this.currTemId = templateId;
            if (this.templates[templateId]) {
                def = $.when(this.templates[templateId]);
            }else {
                def = this['_rpc']({
                    model: "ir.ui.view",
                    method: 'search_read',
                    fields: [],
                    domain: [['id', '=', templateId]],
                    context: {REPORT_ID: id}
                }).then((result) => {
                        let parser = new DOMParser(), xmlDoc = parser.parseFromString(result[0].arch, "text/xml");
                    self.templates[templateId] = xmlDoc;
                    return xmlDoc;
                });
            }
            return def;
        },
        createNewNode: function (tag, xmlDoc, params={}) {
            const {label, field, attributes} = params, node = xmlDoc.createElement(tag);
            Object.keys(attributes).map((attrName) => {
                node.setAttribute(attrName, attributes[attrName]);
            });
            if (label) {
                node.textContent = label;
            }
            if (field) {
                let nodeField = xmlDoc.createElement("span");
                nodeField.setAttribute("t-field", field);
                node.appendChild(nodeField);
            }
            return node;
        },
        getForeachFormChild: function (node) {
            let data = {};
            for (let i=0; i<node.children.length; i++) {
                let child = node.children[i];
                data.field = this.findAttributes(child.attributes, "t-foreach");
                if (data.field) {
                    data.as = this.findAttributes(child.attributes, "t-as");
                    break;
                }
                data = this.getForeachFormChild(child);
                if (data.field) {
                    break;
                }
            }
            return data;
        },
        findNode: function (templateId, path) {
            const xmlDoc = this.templates[templateId];
            if (xmlDoc) {
                let nodeFound = xmlDoc.evaluate(path, xmlDoc, null, XPathResult.ANY_TYPE, null);
                return nodeFound.iterateNext();
            }
        },
        findAttributes: function (attributes, attrName) {
            let attrValue = null;
            for (let i=0; i<attributes.length; i++) {
                let attr = attributes[i];
                if (attr.nodeName.toLowerCase() == attrName) {
                    attrValue = attr.nodeValue;
                    break;
                }
            }
            return attrValue;
        },
        replaceObjField: function (fieldChain, chainReturn=false) {
            let chain = fieldChain.split("."), data = {chain: chain, replace: false};
            if (chain.length > 1 && ["o", "doc"].includes(chain[0])) {
                chain.splice(0, 1);
                data.chain = chain;
                data.replace = true;
            }
            data.chain = chainReturn ? data.chain : data.chain.join(".");
            return data;
        },
        getFieldForeach: function (node) {
            let data = {}, tForeach = $(node).parents("[t-foreach]");
            if (tForeach.length) {
                data.field = tForeach.attr("t-foreach");
                data.as = tForeach.attr("t-as");
            }
            // let data = {}, table = null;
            // while (!data.field && node.parentNode) {
            //     data.field = this.findAttributes(node.attributes, "t-foreach");
            //     if (!data.field) {
            //         if (node.tagName == "table") {
            //             table = node;
            //         }
            //         node = node.parentNode;
            //     }else {
            //         data.as = this.findAttributes(node.attributes, "t-as");
            //     }
            // }
            // if (!data.field && table) {
            //     data = this.getForeachFormChild(table);
            // }
            return data;
        },
        onSaveColumnField: function (path, templateId, data, position) {
            let xmlDoc = this.templates[templateId], {columnName, columnField} = data,
                fieldName = columnField.length > 1 ? columnField[columnField.length-1] : "undefined",
                nodesTH = xmlDoc.evaluate(path.th, xmlDoc, null, XPathResult.ANY_TYPE, null),
                nodesTD = xmlDoc.evaluate(path.td, xmlDoc, null, XPathResult.ANY_TYPE, null);
            columnField = columnField.join(".");
            nodesTH = nodesTH.iterateNext();
            nodesTD = nodesTD.iterateNext();
            let newNodeTH = this.createNewNode("th", xmlDoc, {label: columnName, attributes: {name: `th_${fieldName}`}}),
                newNodeTD = this.createNewNode("td", xmlDoc, {field: columnField, attributes: {name: `td_${fieldName}`}});
            if (position == "before") {
                nodesTH.parentNode.insertBefore(newNodeTH, nodesTH);
                nodesTD.parentNode.insertBefore(newNodeTD, nodesTD);
            }else {
                nodesTH.parentNode.appendChild(newNodeTH);
                nodesTD.parentNode.appendChild(newNodeTD);
            }
            this.saveTemplate();
        },
        onSaveInline: function (el, data, type, position) {
            const path = this.getPathXpath(el), templateID = el.attr("data-oe-id"), xmlDoc = this.templates[templateID];
            let nodes = xmlDoc.evaluate(path, xmlDoc, null, XPathResult.ANY_TYPE, null),
                propsNewNode = {attributes: {}};
            if (type == "text") {
                propsNewNode.label = data.columnName;
            }else {
                propsNewNode.field = data.columnField.join(".");
            }
            nodes = nodes.iterateNext();
            if (nodes) {
                let newNode = this.createNewNode("span", xmlDoc, propsNewNode);
                position == "before" ? nodes.parentNode.insertBefore(newNode, nodes) : nodes.parentNode.appendChild(newNode);
            }
            this.saveTemplate();
        },
        onCancelFieldInCell: function () {
        },
        onCancel: function () {
            $("main").find(".elVirtualEdit, .vtFieldLabel, .vtField, .vtText, .vtFL, .vtBl, .vtCl").remove();
        },
        onCancelFieldColumn: function () {
            $("main").find(".elVirtualEdit, .vtFieldLabel, .vtField, .vtText").remove();
        },
        showChoseField: function (modelName, dataRoot, chain, onSave, onCancel, props={}) {
            this.chooseField = new ChooseField(this, Object.assign(props,
                {modelName: modelName, dataRoot: dataRoot, chain: chain, onSave: onSave, onCancel: onCancel}));
            this.chooseField.renderElement();
            $('body').append(this.chooseField.$el);
        },
        showMediaSelect: function (onSave) {
            const MediaDialog = odoo.__DEBUG__.services['wysiwyg.widgets.MediaDialog'], $image = $('<img/>');
            let mediaDialog = new MediaDialog(this, {
                onlyImages: true,
            }, $image[0]);
            mediaDialog.open();
            mediaDialog.on('save', this, function (image) {
                onSave(image.src);
            });
        },
        virtualColumnField: function (el) {
            let elXpath = el.parent();
            if (!elXpath.hasClass(".virtualActive")) {
                const idxXp = elXpath.index();
                elXpath.parents("table").find(".virtualActive").removeClass("virtualActive");
                elXpath.addClass("virtualActive");
                elXpath.parents("table").find("tr").each(function (idx, tr) {
                    const tdFound = $(tr).find(`td:eq(${idxXp}), th:eq(${idxXp})`);
                    if (!tdFound.hasClass("virtualActive")) {
                        tdFound.addClass("virtualActive");
                    }
                });
            }
        },
        virtualFieldLabel: function (el) {
            if (!el.next().hasClass(".vtFL")) {
                el.parents("main").find(".vtFL").remove();
                el.after($("<div class='vtFL'></div>"));
            }
        },
        virtualBlock: function (el) {
            if (!el.next().hasClass(".vtBl")) {
                el.parents("main").find(".vtBl").remove();
                el.after($("<div class='vtBl'></div>"));
            }
        },
        virtualInline: function (el) {
            if (!el.parent().find("vtText").length) {
                el.parents("main").find(".vtText").remove();
                el.after($("<span class='vtText'>x</span>"));
            }
        },
        virtualInCell: function (el) {
            if (!el.parent().find("vtText").length) {
                el.parents("table").find(".vtText").remove();
                el.after($("<span class='vtText'>x</span>"));
            }
        },
        virtualColumns: function (el, kind="Two") {
            if (!el.next().hasClass(".vtCl")) {
                el.parents("main").find(".vtCl").remove();
                let elColumns = $(QWeb.render(`ReportEdit.${kind}Columns`, {}));
                el.after(elColumns.addClass("vtCl"));
            }
        },
        newColumnField: function (el, obXpath, templateId, position) {
            let dataValues = this.getDataValuesWithPath(obXpath.td), node = this.findNode(templateId, obXpath.td), {as} = this.getFieldForeach(node);
            this.showChoseField("sale.order", dataValues, as ? [as] : [],
                (fieldChain) => this.onSaveColumnField.bind(this)(obXpath, templateId, fieldChain, position), this.onCancelFieldColumn.bind(this));
        },
        newInline: function (elXpath, templateId, type, position) {
            const dataValues = JSON.parse(elXpath.attr("data-values"));
            this.showChoseField("sale.order", dataValues, [],
                (data) => this.onSaveInline.bind(this)(elXpath, data, type, position),
                this.onCancelFieldInCell.bind(this), {[type == "text" ? 'hideField' : 'hideName']: true});
        },
        newInCell: function (elXpath, templateId, type, position) {
            const xpath = this.getPathXpath(elXpath), dataValues = JSON.parse(elXpath.attr("data-values"));
            let node = this.findNode(templateId, xpath), {as} = this.getFieldForeach(node);
            this.showChoseField("sale.order", dataValues, as && (as in dataValues) ? [as] : [],
                (data) => this.onSaveInline.bind(this)(elXpath, data, type, position),
                this.onCancelFieldInCell.bind(this), {[type == "text" ? 'hideField' : 'hideName']: true});
        },
        onSaveBlock: function (newNode, nodeXpath, data, position) {
            newNode = $(newNode).find("span").attr({'t-field': data.columnField.join(".")})[0];
            position == "before" ? nodeXpath.parentNode.insertBefore(newNode, nodeXpath) : nodeXpath.parentNode.appendChild(newNode);
            this.saveTemplate();
        },
        newBlock: function (elXpath, viewId, type, position) {
            const xpath = this.getPathXpath(elXpath), xmlDoc = this.templates[viewId],
                dataValues = this.getDataValuesWithPath(xpath);
            let nodeXpath = xmlDoc.evaluate(xpath, xmlDoc, null, XPathResult.ANY_TYPE, null),
                newNode = QWeb.templates[`ReportEdit.${this.capitalizeFirstLetter(type)}Block`].children[0];
            newNode = newNode.cloneNode(true);
            nodeXpath = nodeXpath.iterateNext();
            if (type == "field") {
                this.showChoseField("sale.order", dataValues, [],
                    (data) => this.onSaveBlock.bind(this)(newNode, nodeXpath, data, position), this.onCancel.bind(this), {hideName: true});
            }else {
                position == "before" ? nodeXpath.parentNode.insertBefore(newNode, nodeXpath) : nodeXpath.appendChild(newNode);
                this.saveTemplate();
            }
        },
        stringToXml: function (str) {
            return (new DOMParser().parseFromString(str, "text/xml")).children[0];
        },
        onSaveFieldLabel: function (newNode, nodeXpath, colIdx, data, position) {
            let field = `<span t-field='${data.columnField.join(".")}' />`,
                label = `<span><strong>${data.columnName}:</strong><br /></span>`;
            if (newNode) {
                newNode = $(newNode);
                newNode.find(`.col-3:eq(${colIdx})`).append(label).append(field);
                position == "append" ? nodeXpath.appendChild(newNode[0]) : nodeXpath.parentNode.insertBefore(newNode[0], nodeXpath);
            }else {
                nodeXpath.appendChild(this.stringToXml(label));
                nodeXpath.appendChild(this.stringToXml(field));
            }
            this.saveTemplate();
        },
        newFieldLabel: function (col, viewId, colIdx, exist) {
            let xmlDoc = this.templates[viewId], newNode = null,
                position = col.parents("main").find("div.page").hasClass("noChild") ? "append" : "before";
            if (!exist) {
                newNode = QWeb.templates["ReportEdit.Block.VirtualFieldLabel"].children[0];
                newNode = newNode.cloneNode(true);
            }
            let xpath = this.getPathXpath(col), dataValues = this.getDataValuesWithPath(xpath),
                nodeXpath = xmlDoc.evaluate(xpath, xmlDoc, null, XPathResult.ANY_TYPE, null);
            nodeXpath = nodeXpath.iterateNext();
            this.showChoseField(null, dataValues, [],
                    (data) => this.onSaveFieldLabel.bind(this)(newNode, nodeXpath, colIdx, data, position), this.onCancel.bind(this), {});
        },
        onSaveNewTable: function (nodeXpath, data, position) {
            let newNode = QWeb.templates["ReportEdit.Table"].children[0];
            newNode = $(newNode.cloneNode(true));
            newNode.find("[t-as='line']").attr({"t-foreach": data.columnField.join(".")});
            if (position == "append") {
                nodeXpath.appendChild(newNode[0]);
            }else {
                nodeXpath.parentNode.insertBefore(newNode[0], nodeXpath);
            }
            this.saveTemplate();
        },
        newTable: function (elXpath, viewId, position) {
            const xpath = this.getPathXpath(elXpath), xmlDoc = this.templates[viewId],
                dataValues = this.getDataValuesWithPath(xpath);
            let nodeXpath = xmlDoc.evaluate(xpath, xmlDoc, null, XPathResult.ANY_TYPE, null);
            nodeXpath = nodeXpath.iterateNext();
            let sfOptions = {filter: (field) => {return ["many2one", "one2many"].includes(field.type)}};
            this.showChoseField(null, dataValues, [], (data) => this.onSaveNewTable(nodeXpath, data, position), this.onCancel.bind(this),
                {hideName: true, options: sfOptions});
        },
        onSaveSubTotal: function (nodeXpath, data, position) {
            let newNode = QWeb.templates["ReportEdit.SubTotal"].children[0];
            newNode = $(newNode.cloneNode(true));
            const {tax, total, subtotal} = data, nodeFac = (label, field, fieldName, _class="") => {
                let nodeNode = this.stringToXml(`<tr class='${_class}'><td name='td_${fieldName}_label'><strong>${label}</strong></td><td name='td_${fieldName}' class="text-right"><span t-field="${field}" /></td></tr>`);
                newNode.find("t_body".replace("_", "")).append(nodeNode);
            };
            if (tax) {
                nodeFac("Taxes", tax.columnField.join("."), tax.columnField[tax.columnField.length-1]);
            }
            if (total) {
                nodeFac("Total", total.columnField.join("."), total.columnField[total.columnField.length-1], "border-black o_total");
            }
            if (subtotal) {
                nodeFac("Subtotal", subtotal.columnField.join("."), subtotal.columnField[subtotal.columnField.length-1], "border-black o_subtotal");
            }
            position == "append" ? nodeXpath.appendChild(newNode[0]) : nodeXpath.parentNode.insertBefore(newNode[0], nodeXpath);
            this.saveTemplate();
        },
        newSubTotal: function (elXpath, viewId, position) {
            const xpath = this.getPathXpath(elXpath), xmlDoc = this.templates[viewId],
                dataValues = this.getDataValuesWithPath(xpath);
            let nodeXpath = xmlDoc.evaluate(xpath, xmlDoc, null, XPathResult.ANY_TYPE, null);
            nodeXpath = nodeXpath.iterateNext();
            this.showChoseField(null, dataValues, [], (data) => this.onSaveSubTotal(nodeXpath, data, position),
                this.onCancel.bind(this), {hideName: true, multiple: [
                    {label: "Subtotal", name: "subtotal"}, {label: "Taxes", name: "taxes"}, {label: "Total", name: "total"}]});
        },
        newColumns: function (elXpath, viewId, type, position) {
            const xpath = this.getPathXpath(elXpath), xmlDoc = this.templates[viewId];
            let nodeXpath = xmlDoc.evaluate(xpath, xmlDoc, null, XPathResult.ANY_TYPE, null),
                newNode = QWeb.templates[`ReportEdit.${this.capitalizeFirstLetter(type)}Columns`].children[0];
            newNode = newNode.cloneNode(true);
            nodeXpath = nodeXpath.iterateNext();
            position == "before" ? nodeXpath.parentNode.insertBefore(newNode, nodeXpath) : nodeXpath.appendChild(newNode);
            this.saveTemplate();
        },
        newImage: function (elXpath, viewId, imgSrc) {
            const xpath = this.getPathXpath(elXpath), xmlDoc = this.templates[viewId];
            let nodeXpath = xmlDoc.evaluate(xpath, xmlDoc, null, XPathResult.ANY_TYPE, null),
                newNode = `<img src='${imgSrc}' class='img-fluid' />`;
            nodeXpath = nodeXpath.iterateNext();
            nodeXpath.parentNode.insertBefore(this.stringToXml(newNode), nodeXpath);
            this.saveTemplate();
        },
        startSort: function (ui) {
            let el = ui.item, elType = el.attr("type"), elIdx = el.index();
            if (elType == "component") {
                $(".elActive").removeClass("elActive");
                let sortType = ui.item.parent().attr("name");
                ui.helper.attr({sortType: sortType, move: true});
            }
            if (!elType && !el.attr("node-id")) {
                let nodeId = String(Math.random()).replace("0.", "PD");
                el.attr("node-id", nodeId);
                el.parents("table").find("t_body > tr".replace("_", "")).each(function (idx, tr) {
                    $(tr).find("td").eq(elIdx).attr("node-for", nodeId);
                });
            }
        },
        capitalizeFirstLetter: function(str) {
          return str.charAt(0).toUpperCase() + str.slice(1);
        },
        sortMove: function (ui) {
            let sortType = ui.item.parent().attr("name"), trParent = ui.placeholder.parents("tr").length;
            if (ui.placeholder.parents("._wContent").length) {
                ui.helper.addClass("vtNewMove");
                if (sortType == "field_column" && trParent) {
                    this.virtualColumnField(ui.placeholder);
                }else if (["field_in_cell", "text_in_cell"].includes(sortType) && trParent) {
                    this.virtualInCell(ui.placeholder);
                }else if (["two_columns", "three_columns"].includes(sortType)) {
                    this.virtualColumns(ui.placeholder, this.capitalizeFirstLetter(sortType.replace("_columns", "")));
                }else if (["text_inline", "field_inline"].includes(sortType)) {
                    this.virtualInline(ui.placeholder);
                }else if (["text_block", "field_block", "title_block", "image", "table", "sub_total"].includes(sortType)) {
                    this.virtualBlock(ui.placeholder);
                }else if (["field_label"].includes(sortType)) {
                    this.virtualFieldLabel(ui.placeholder);
                }
            }
        },
        getTemplateId: function (el) {
            return el.attr("data-oe-id") || el.attr("view_id");
        },
        getPathXpath: function (el) {
            return el.attr("data-oe-xpath") || el.attr("path-xpath") || el.attr("will_xpath");
        },
        getElXpath: function (el) {
            let parent = el.parent(), elXpath = parent.next(), position = "before";
            if (!elXpath.length) {
                elXpath = parent.prev();
                position = "append";
            }
            if (!elXpath.length) {
                elXpath = parent.parent();
                position = "append";
            }
            if (!this.getTemplateId(elXpath)) {
                elXpath = el.closest("[data-oe-id]")
            }
            return {elXpath: elXpath, position: position};
        },
        getDataValuesWithPath: function (path) {
            return JSON.parse($("main").find(`[data-oe-xpath='${path}'], [path-xpath='${path}']`).attr("data-values"));
        },
        propsSort: function (el, elXpath, sortType) {
            let params = {};
            if (sortType == "field_label") {
                params.elXpath = el.parent();
                params.colIndex = params.elXpath.index();
                params.exist = el.closest(".row.vtFieldLabel").length ? false : true;
            }else if (sortType == "field_column") {
                let elXpath = el.parents("table").find(".virtualActive"), obXpath = {td: null, th: null};
                elXpath.each((idx, elXp) => {
                    let $elXp = $(elXp), path = this.getPathXpath($elXp), tagName = elXp.tagName.toLowerCase();
                    if (!obXpath[tagName]) {
                        obXpath[tagName] = path;
                    }
                });
                params.obXpath = obXpath;
            }else if (sortType == "sub_total") {
                let elXpath = el.closest(".vtFieldLabel");
                if (elXpath.length > 0) {
                    params.elXpath = elXpath.parent();
                    params.position = "append";
                }
            }else if (sortType == "table") {
                let parent = el.parent(), elXpath = parent.next(), position = "before";
                if (!elXpath.length) {
                    elXpath = parent.parent();
                    position = "append";
                }
                params.elXpath = elXpath;
                params.position = position;
            }
            return params;
        },
        stopSort: function (el) {
            if (el.parents("._wReportKanBan").length) {
                // const {reloadProperty} = this.props;
                let self = this, type = el.attr("type"), sortType = el.attr("sortType"),
                    {elXpath, position} = this.getElXpath(el), viewId = this.getTemplateId(elXpath);
                if (type == "component" && viewId) {
                    const params = this.propsSort(el, elXpath, sortType);
                    this.getPdfTemplate(viewId).then(() => {
                        if (sortType == "field_column") {
                            self.newColumnField(elXpath, params.obXpath, viewId, position);
                        }else if (["two_columns", "three_columns"].includes(sortType)) {
                            self.newColumns(elXpath, viewId, sortType.replace("_columns", ""), position);
                        }else if (["text_in_cell", "field_in_cell"].includes(sortType)) {
                            self.newInCell(elXpath, viewId, sortType.replace("_in_cell", ""), position);
                        }else if (["text_inline", "field_inline"].includes(sortType)) {
                            self.newInline(elXpath, viewId, sortType.replace("_inline", ""), position);
                        }else if (["text_block", "field_block", "title_block"].includes(sortType)) {
                            self.newBlock(elXpath, viewId, sortType.replace("_block", ""), position);
                        }else if (["field_label"].includes(sortType)) {
                            self.newFieldLabel(params.elXpath, viewId, params.colIndex, params.exist);
                        }else if (["image"].includes(sortType)) {
                            self.showMediaSelect((imgSrc) => self.newImage(elXpath, viewId, imgSrc))
                        }else if (["table"].includes(sortType)) {
                            self.newTable(params.elXpath, viewId, params.position);
                        }else if (["sub_total"].includes(sortType)) {
                            self.newSubTotal(params.elXpath, viewId, params.position);
                        }
                        // el.remove();
                    });
                }
                self._renderProperty(true);
            }
            this.removeHelper();
        },
        getReportData: function (funcRender) {
            this['_rpc']({
                model: 'ir.actions.report',
                method: 'search_read',
                fields: [],
                domain: [['id', '=', this.getReportId()]],
            }).then((data) => {
                if (data && data.length) {
                    funcRender(data[0]);
                }
            })
        },
        onRemoveNode: function () {
            if (this.xmlActive && this.elActive) {
                let xmlDoc = this.templates[this.xmlActive], path = this.getPathXpath(this.elActive),
                    nodes = xmlDoc.evaluate(path, xmlDoc, null, XPathResult.ANY_TYPE, null);
                nodes = nodes.iterateNext();
                if (nodes) {
                    nodes.parentNode.removeChild(nodes);
                    this.saveTemplate();
                }
            }
        },
        getReportId: function () {
            const {id} = this.ref.content.reportData;
            return id;
        },
        _prepareParamProperty: function () {
            let res = this._super();
            res.mainEdit = this;
            res.saveTemplate = this.saveTemplate.bind(this);
            // res.getFieldForeach = this.getFieldForeach.bind(this);
            res.replaceObjField = this.replaceObjField.bind(this);
            res.getFieldWidget = this.getFieldWidget.bind(this);
            res.onHoverComponents = this.onHoverComponents.bind(this);
            res.getReportData = this.getReportData.bind(this);
            res.saveReportProps = this.saveReportProps.bind(this);
            res.onClickNode = this.onClickNode.bind(this);
            res.findNodeByPath = this.findNodeByPath.bind(this);
            res.getNodeFromEl = this.getNodeFromEl.bind(this);
            return res;
        },
        _prepareParamContent: function () {
            let res = this._super();
            const {action} = this.props;
            res.action = action;
            res.onCreateTemplate = this.onCreateTemplate.bind(this);
            res.onReportToDom = this.onReportToDom.bind(this);
            return res;
        },
    });

    return ReportEdit;
});
