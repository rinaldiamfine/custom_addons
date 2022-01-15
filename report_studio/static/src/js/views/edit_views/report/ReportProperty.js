odoo.define('report_studio.ReportProperty', function (require) {
"use strict";

    var core = require('web.core');
    var Base = require('report_studio.BaseEdit');
    var FieldBasic = require('report_studio.FieldBasic');


    var ReportProperty = Base.PropertyBase.extend({
        start: function () {
            this._super();
            this.state.tab = "component";
            this.state.node = false;
            this.tabs.fields = {label: "Report", name: "fields", icon: "fa-foursquare", render: this.renderTabReport.bind(this)};
            delete this.tabs.property;
            this.tabs.component.label = "Add";
            this.components = {
                block: {label: "BLock", class: "_wComTag", type: "component"},
                inline: {label: "Inline", class: "_wComTag", type: "component"},
                table: {label: "Table", class: "_wComTag", type: "component"},
                column: {label: "Column", class: "_wComTag", type: "component"}};
            this.components.block.child = {
                text: {name: "text_block", label: "Text"},
                field: {name: "field_block", label: "Field"},
                title_block: {name: "title_block", label: "Title Block"},
                field_label: {name: "field_label", label: "Field Label"},
                image: {name: "image", label: "Image"},
                // address_block: {name: "address_block", label: "Address Block"},
            }
            this.components.inline.child = {
                text: {name: "text_inline", label: "Text"},
                field: {name: "field_inline", label: "Field"}
            };
            this.components.table.child = {
                table: {name: "table", label: "Data Table"},
                field_column: {name: "field_column", label: "Field Column"},
                text_in_cell: {name: "text_in_cell", label: "Text in Cell"},
                field_in_cell: {name: "field_in_cell", label: "Field in Cell"},
                sub_total: {name: "sub_total", label: "Subtotal & Total"}
            };
            this.components.column.child = {
                two_columns: {name: "two_columns", label: "Two Columns"},
                three_columns: {name: "three_columns", label: "Threef Columns"},
            };
        },
        onChangeReportData: function (prop, data) {
            const {saveReportProps} = this.props;
            if (saveReportProps) {
                saveReportProps({id: this.reportData.id, values: {[prop.name]: data}});
            }
        },
        onClickEl: function (el) {
            const {mainEdit} = this.props;
            mainEdit.onClickNode(el, false);
        },
        setNodeActive: function (node, render=true) {
            this.state.node = node;
            if (render) {
                this.renderProperty();
            }
        },
        setElActive: function (el) {
            this.state.el = el;
        },
        _renderTabReport: function (el, reportData) {
            const fields = [{name: 'display_name', string: "Name", widget: FieldBasic.Input},
                {name: 'groups_id', string: "Group", widget: FieldBasic.Groups},
                {name: 'paperformat_id', relation: "report.paperformat", string: "Paper format", widget: FieldBasic.Relation},
                {name: 'binding_model_id', string: "Add in the print menu", widget: FieldBasic.Checkbox}];
            this.reportData = reportData;
            fields.map((prop) => {
                let props = Object.assign(prop, {onChange: (data) => this.onChangeReportData.bind(this)(prop, data), value: reportData[prop.name], label: prop.string});
                if (prop.name == "binding_model_id") {
                    props.value = props.value ? true : false;
                }
                if (prop.name == "groups_id") {
                    props.typeResult = "id";
                }
                const propWidget = new prop.widget(this, props);
                propWidget.renderElement();
                el.append(propWidget.$el);
            });
        },
        renderTabReport: function () {
            const {getReportData} = this.props, el = $("<div>");
            if (getReportData) {
                getReportData((reportData) => this._renderTabReport.bind(this)(el, reportData));
            }
            return el;
        },
        preparePropsTab: function () {
            let res = this._super();
            res.scroll = true;
            return res;
        },
        paddingProperty: function (styles) {
            let result = {};
            ["padding-top", "padding-bottom", "padding-right", "padding-left"].filter(
                (pad) => pad in styles).map((pad) => {result[pad] = this.replaceWo(styles[pad])});
            return result;
        },
        marginProperty: function (styles) {
            let result = {};
            ["margin-top", "margin-bottom", "margin-right", "margin-left"].filter(
                (pad) => pad in styles).map((pad) => {result[pad] = this.replaceWo(styles[pad])});
            return result;
        },
        replaceWo: function (data) {
            return data.replaceAll(" ", "").replaceAll("!important", "").replaceAll("px", "")
        },
        widthProperty: function (styles) {
            return 'width' in styles ? {width: this.replaceWo(styles.width)} : {};
        },
        colorProperty: function (styles) {
            return 'color' in styles ? {color: this.replaceWo(styles.color)} : {};
        },
        backgroundProperty: function (styles) {
            return 'background' in styles ? {background: this.replaceWo(styles.background)} : {};
        },
        preparePropertyNode: function (node) {
            let fieldNode = node.getAttribute("t-field"), escNode = node.getAttribute("t-esc"),
                visibleIf = node.getAttribute("t-if"), lClass = this.getClassNode(node);
            let property = {visibleIf: visibleIf, fieldNode: fieldNode, escNode: escNode};
            const {el} = this.state;
            const alignCheck = {"text-right": "right", "text-left": "left", "text-center": "center"}, styles = this.getStyleNode(node);
            if (fieldNode) {
                const dataRoot = el.attr("data-values"),
                    chain = fieldNode.split("."), widgetOption = el.attr("options-values");
                property.fieldNode = {chain: chain, widgetOptions: widgetOption ? JSON.parse(widgetOption) : {},
                    dataRoot: dataRoot ? JSON.parse(dataRoot) : {}};
            }
            if (lClass.length > 0) {
                property.textAlign = lClass.filter((val) => val in alignCheck).join(" ");
                property.classes = lClass.filter((val) => !(val in alignCheck)).join(" ");
            }
            if (Object.keys(styles).length) {
                const textAlign = styles['text-align'], textUnderline = styles['text-decoration'],
                    fontStyle = styles['font-style'], fontWeight = styles['font-weight'];
                if (textAlign && ['left', 'center', 'right'].filter((val) => textAlign.indexOf(val) >= 0).length) {
                    property.textAlign = textAlign;
                }
                if (textUnderline && textUnderline.indexOf("underline") >= 0) {
                    property.textUnderline = textUnderline;
                }
                if (fontWeight && ["600", "700", "800", "900", "bold", "bolder"].filter((val) => fontWeight.indexOf(val) >= 0).length) {
                    property.fontWeight = "bold";
                }
                if (fontStyle && fontStyle.indexOf("italic") >= 0) {
                    property.fontStyle = fontStyle;
                }
                Object.assign(property, this.colorProperty(styles));
                Object.assign(property, this.backgroundProperty(styles));
                Object.assign(property, this.widthProperty(styles));
                Object.assign(property, this.paddingProperty(styles));
                Object.assign(property, this.marginProperty(styles));
            }
            if (node.children.length == 0 && (node.firstChild === null || node.firstChild.nodeName === "#text")) {
                property.text = node.textContent;
            }
            return property
        },
        getStyleNode: function (node) {
            let styles = node.getAttribute("style") || "", styleObj = {};
            if (!styles) {
                return styleObj;
            }
            styles = styles.split(";");
            for (let i=0; i<styles.length; i++) {
                let style = styles[i].split(":"), name = style[0], val = style[1];
                styleObj[name] = val;
            }
            return styleObj;
        },
        objStyleToStr: function (objStyle) {
            let strStyle = "";
            Object.keys(objStyle).map((styleName) => {strStyle += `${styleName}: ${objStyle[styleName]};`});
            return strStyle.substring(0, strStyle.length - 1);
        },
        getClassNode: function (node) {
            return ((node.getAttribute("class") || "").split(" ")).map((cl) => cl.replace(" ", ""));
        },
        setNodeStyle: function (node, style) {
            let styles = this.getStyleNode(node), {name, value, remove} = style;
            if (remove) {
                delete styles[name];
            }else {
                styles[name] = value + " !important";
            }
            node.setAttribute("style", this.objStyleToStr(styles));
        },
        onReportReload: function () {
            this.renderProperty();
        },
        onChangeProperty: function (propertyChange) {
            const {node} = this.state, {saveTemplate} = this.props, {name, value, remove} = propertyChange;
            if (name == "text") {
                node.textContent = value;
            }else if (name == "classes") {
                node.setAttribute("class", value);
            }else if (name == "field") {
                node.setAttribute("t-field", value);
            }else if (name == "esc") {

            }else if (name == "width") {
                this.setNodeStyle(node, {name: name, value: value + "px"});
            }else if (["padding-top", "padding-left", "padding-right", "padding-bottom"].includes(name)) {
                this.setNodeStyle(node, {name: name, value: value + "px"});
            }else if (["margin-top", "margin-left", "margin-right", "margin-bottom"].includes(name)) {
                this.setNodeStyle(node, {name: name, value: value + "px"});
            }else if (["text-decoration", "font-style", "font-weight", "text-align"].includes(name)) {
                this.setNodeStyle(node, {name: name, value: value, remove: remove});
            }else if (["color", "background"].includes(name)) {
                this.setNodeStyle(node, {name: name, value: value});
            }else if (["font-size"].includes(name)) {
                this.setNodeStyle(node, {name: name, value: value});
            }else if (name == "options") {
                node.setAttribute("t-options", value);
            }
            if (saveTemplate) {
                saveTemplate();
            }
        },
        _renderProperty: function () {
            const {fields} = this.props.viewInfo, {node, el} = this.state;
            let dataRoot = el.attr("data-values") || '{}';
            this.nodeProperty = new FieldBasic.ParentElNode(this, {data: this.preparePropertyNode(node), elNode: el,
                dataRoot: JSON.parse(dataRoot), preparePropertyNode: this.preparePropertyNode.bind(this),
                onClickEl: this.onClickEl.bind(this), onChange: this.onChangeProperty.bind(this), fields: fields, widgets: this.fieldWidget});
            this.nodeProperty.renderElement();
            this.$el.find(".wLProP").empty().append(this.nodeProperty.$el);
        },
        renderProperty: function () {
            let self = this;
            const {getFieldWidget} = this.props;
            if (!this.fieldWidget) {
                this.fieldWidget = getFieldWidget().then(function (result) {
                    self.fieldWidget = result;
                    self._renderProperty();
                });
            }else {
                self._renderProperty();
            }
        },
        onHoverComponents: function (e) {
            const {onHoverComponents} = this.props;
            if (onHoverComponents) {
                onHoverComponents(e);
            }
        },
        bindAction: function () {
            this._super();
            // this.$el.find("._wComItem a").click(this.onHoverComponents.bind(this))
            this.$el.find("._wComItem a").mouseout(this.onHoverComponents.bind(this))
            this.$el.find("._wComItem a").mouseover(this.onHoverComponents.bind(this))
        }
    });

    return ReportProperty;
});
