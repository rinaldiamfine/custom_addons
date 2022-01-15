odoo.define('report_studio.FieldBasic', function (require) {
"use strict";

    var core = require('web.core');

    var QWeb = core.qweb;
    var Widget = require('web.Widget');
    var BasicField = require('web.basic_fields');
    var FieldRegistry = require('web.field_registry')
    var RelationalFields = require('web.relational_fields');
    var FieldManagerMixin = require('web.FieldManagerMixin');
    var StandaloneFieldManagerMixin = require('web.StandaloneFieldManagerMixin');
    var ServiceProviderMixin = require('web.ServiceProviderMixin');
    var mixins = require('web.mixins');
    var colorPickerDialog = require('web.ColorpickerDialog');
    var ModelFieldSelector = require('web.ModelFieldSelector');
    var BasicModel = require('web.BasicModel');


    var Radio = Widget.extend({
        template: 'EditView.Radio',
        init: function(parent, params) {
            const {value} = params;
            this.props = params;
            this.state = {value: value || false};
        },
        setState: function (params) {
            Object.keys(params).map((name) => {
                this.state[name] = params[name];
            });
        },
        _onCheck: function (e) {
            const {value} = this.state, {onChange} = this.props;
            this.setState({value: !value});
            this.bindClass();
            if (!value && onChange) {
                onChange(this.props);
            }
        },
        getValue: function () {
            return this.state.value;
        },
        setValue: function (value) {
            this.setState({value: value});
        },
        bindAction: function () {
            this.$el.click(this._onCheck.bind(this));
        },
        bindClass: function () {
            const {value} = this.state;
            value ? this.$el.addClass("checked") : this.$el.removeClass("checked");
        },
        reload: function () {
            this.renderElement();
        },
        renderElement: function () {
            this._super();
            this.bindClass();
            this.bindAction();
        }
    });

    var Checkbox = Widget.extend({
        template: 'EditView.Checkbox',
        init: function(parent, params) {
            const {value} = params;
            this.props = params;
            this.readonly = params.readonly || false;
            this.state = {value: this.prepareValue(value)};
        },
        setState: function (params) {
            Object.keys(params).map((name) => {
                this.state[name] = params[name];
            });
        },
        prepareValue: function (value) {
            return ["1", "True", "true", true].includes(value);
        },
        _onCheck: function (e) {
            if (!this.readonly) {
                let el = $(e.currentTarget);
                const {value} = this.state, {onChange} = this.props;
                value ? el.removeClass("checked") : el.addClass("checked");
                this.setState({value: !value});
                if (onChange) {
                    onChange(!value);
                }
            }
        },
        getValue: function () {
            return this.state.value;
        },
        setValue: function (value) {
            this.setState({value: value});
        },
        bindAction: function () {
            this.$el.click(this._onCheck.bind(this));
        },
        bindClass: function () {
            const {value} = this.state, {noLabel} = this.props;
            value ? this.$el.addClass("checked") : this.$el.removeClass("checked");
            if (noLabel) {
                this.$el.find(".lblField").addClass("hide");
            }
        },
        reload: function () {
            this.renderElement();
        },
        renderElement: function () {
            this._super();
            this.bindClass();
            this.bindAction();
        }
    });

    var GroupRadio = Widget.extend({
        template: 'EditView.Radio.Group',
        init: function(parent, params) {
            this.props = params;
            this.ref = {checks: []};
        },
        _renderRadio: function () {
            const {selection} = this.props, wRadio = this.$el.find("._wGrCc");
            selection.map((item) => {
                let radio = new Radio(this, {...item, onChange: this.onChange.bind(this)});
                this.ref.checks.push(radio);
                radio.renderElement();
                wRadio.append(radio.$el);
            });
        },
        onChange: function (data) {
            this.ref.checks.filter((radio) => radio.props.key !== data.key).map(
                (radio) => {
                    radio.setState({value: false});
                    radio.bindClass();
                });
        },
        bindStyle: function () {
            const {noLabel, direction} = this.props;
            if (noLabel) {
                this.$el.find("._wGrHead.lblField").addClass("hide");
            }
            this.$el.addClass(direction || "_column");
        },
        renderElement: function () {
            this._super();
            this._renderRadio();
            this.bindStyle();
        }
    });

    var GroupCheckBox = Widget.extend({
        template: 'EditView.Checkbox.Group',
        init: function(parent, params) {
            this.props = params;
            this.ref = {checks: []};
        },
        _renderRadio: function () {
            const {selection} = this.props, wCheckbox = this.$el.find("._wGrCc");
            selection.map((item) => {
                let checkbox = new Checkbox(this, {...item});
                this.ref.checks.push(checkbox);
                checkbox.renderElement();
                wCheckbox.append(checkbox.$el);
            });
        },
        onChange: function (data) {},
        bindStyle: function () {
            const {noLabel} = this.props;
            if (noLabel) {
                this.$el.find("._wGrHead.lblField").addClass("hide");
            }
        },
        renderElement: function () {
            this._super();
            this._renderRadio();
            this.bindStyle();
        }
    });

    var Input = Widget.extend({
        template: 'EditView.Input',
        init: function (parent, params) {
            const {value} = params;
            this.props = params;
            this.modifiers = params.modifiers || {};
            this.oldVal = value;
            this.state = {value: value || ""};
            this.ref = {};
        },
        setState: function (params) {
            Object.keys(params).map((name) => {
                this.state[name] = params[name];
            });
        },
        setValue: function (value) {
            this.setState({value: value || ""});
        },
        getValue: function () {
            return this.state.value;
        },
        onKeyUp: function (e) {
            const {onChange} = this.props, value = $(e.currentTarget).val();
            this.setState({value: value});
            if (onChange && e.keyCode == 13) {
                this.oldVal = value;
                onChange(value);
            }
            this.$el[this.oldVal != value ? "addClass" : "removeClass"]("_oSave");
        },
        bindAction: function () {
            this.$el.find("input").keyup(this.onKeyUp.bind(this));
        },
        bindStyle: function () {
            const {readonly, required, noLabel} = this.props;
            if (this.modifiers.required || required) {
                this.$el.addClass("required");
            }
            if (this.modifiers.readonly || readonly) {
                this.$el.find("input,textarea").addClass("readonly");
            }
            if (this.modifiers.nolabel || noLabel) {
                this.$el.find(".lblField").addClass("hide");
            }
            // if (readonly) {
            //     this.$el.find("input,textarea").attr({readonly: "readonly"});
            // }
        },
        reload: function () {
            this.renderElement();
        },
        renderElement: function () {
            this._super();
            this.bindAction();
            this.bindStyle();
        }
    });

    var WidgetBase = Widget.extend({
        init: function (parent, params) {
            // this._super(parent);
            this.ref = {};
            this.props = params;
            this.start();
        },
        start: function () {},
        setState: function (params) {
            Object.keys(params).map((name) => {
                this.state[name] = params[name];
            });
        },
        _beforeRender: function () {

        },

        _afterRender: function () {

        },
        bindAction: function () {

        },
        reload: function () {
            this.renderElement();
        },
        renderElement: function () {
            this._beforeRender();
            this._super();
            this.bindAction();
            this._afterRender();
        }
    });

    var One2many = WidgetBase.extend({

    });



    var Tab = WidgetBase.extend({
        template: 'ViewEdit.Tab',
        init: function (parent, params) {
            this._super(parent, params);
            this.newTab = {};
            this.state = {data: params.data};
            this.ref = {};
        },
        bindClass: function () {
            const {data} = this.state;
            this.$el.find("> ._tabHead > [tab-name]").removeClass("active");
            this.$el.find("[tab-name='"+data+"']").addClass("active");
        },
        binAction: function () {
            this.$el.find('> ._tabHead > [tab-name]').click(this.onClickTab.bind(this));
        },
        onAddTab: function () {
            const {onAddTab, fieldNode} = this.props;
            onAddTab(fieldNode.nodeId)
        },
        onClickTab: function (e) {
            // e.stopPropagation();
            // e.stopImmediatePropagation();
            const {add, onClickTab} = this.props;
            let $el = $(e.currentTarget), tabName = $el.attr("tab-name");
            if (tabName === 'add' && add) {
               this.onAddTab();
               return true;
            }
            this.setState({data: tabName});
            this._renderTabContent();
            if (onClickTab) {
                onClickTab();
            }
        },
        _renderTabContent: function (force=false) {
            const {scroll} = this.props;
            this.$el.find("[content-for]").removeClass("show").addClass("hide");
            if (scroll) {
                this.$el.find('._tabContent').addClass("_divSB");
            }
            if (!(this.state.data in this.tabs)) {
                let tabName = Object.keys(this.tabs).filter((tName) => tName != "add");
                if (tabName.length) {
                    this.setState({data: tabName[tabName.length-1]})
                }
            }
            const {data} = this.state;
            if (!(data in this.ref) || force) {
                this.ref[data] = this.tabs[data].render();
                this.ref[data].attr({"content-for": data});
                this.$el.find('[content-for="'+data+'"]').remove();
                this.$el.find('._tabContent').append(this.ref[data]);
            }else {
                let tabContent = this.$el.find("[content-for='"+data+"']");
                if (!tabContent.length) {
                    this.$el.find('._tabContent').append(this.ref[data]);
                }
                this.$el.find("[content-for='"+data+"']").removeClass("hide").addClass("show");
            }
            this.bindClass();
        },
        _beforeRender: function () {
            const {add, tabs} = this.props;
            this.tabs = Object.assign(tabs || {}, this.newTab);
            delete this.tabs["add"];
            if (add) {
                this.tabs['add'] = {icon: "fa fa-plus", name: "add"};
            }
        },
        reload: function () {
            this._super();
        },
        renderElement: function () {
            this._super();
            this._renderTabContent();
            this.binAction();
        }
    });

    var Button = Widget.extend({
        template: 'ViewEdit.Button',
        init: function (parent, params) {
            this.state = {type: "action"}
        },
        onClickBtn: function () {
        },
        binAction: function () {
            this.$el.click(this.onClickBtn.bind(this));
        },
        renderElement: function () {
            this._super();
            this.binAction();
        }
    });

    var TextArea = Input.extend({
        template: 'EditView.TextArea',
    });

    var Many2manyTagCheckbox = GroupCheckBox.extend({
        init: function(parent, params) {
            const {record, name} = params;
            let selection = record.specialData[name].map((option) => ({value: option[0], label: option[1]}));
            params.selection = selection;
            this._super(parent, params);
        }
    });

    var RadioWidget = GroupRadio.extend({
        init: function(parent, params) {
            const {record, field, name, fieldsInfo} = params;
            // let val = field.selection ? field.selection.filter((option) => option[0] == record.data[name]) : [];
            // this.nodeOptions.horizontal ? ' o_horizontal' : ' o_vertical';
            let selection = field.selection.map((option) => ({value: option[0], label: option[1]}));
            params.selection = selection;
            params.direction = (fieldsInfo.options || {}).horizontal ? "_row" : "_column";
            this._super(parent, params);
        }
    });

    var Char = Input.extend({
        init: function(parent, params) {
            const {record, name} = params;
            params.value = record.data[name];
            this._super(parent, params);
        }
    });

    var Integer = Input.extend({
        init: function(parent, params) {
            const {record, name} = params;
            params.value = String(record.data[name]);
            this._super(parent, params);
        }
    });

    var Many2one = Input.extend({
        init: function(parent, params) {
            const {record, name} = params, data = record.data[name];
            params.value = data ? data.data.display_name || "" : "";
            this._super(parent, params);
        }
    });

    var Selection = WidgetBase.extend({
        template: "Edit.Field.Selection",
        init: function (parent, params) {
            this._super(parent, params);
            this.state = {value: params.value || false}
        },
        start: function () {
            this.data = this.prepareData();
        },
        getValue: function () {
            return this.state.value;
        },
        prepareData: function () {
            const {data} = this.props;
            return data;
            // const {fieldType} = this.props;
            // return Object.keys(FieldRegistry.map).filter((widgetName) => {
            //     let widget = FieldRegistry.map[widgetName], {supportedFieldTypes} = widget.prototype;
            //     return supportedFieldTypes && supportedFieldTypes.includes(fieldType || "char");
            // }).map((widgetName) => ({label: this.capitalize(widgetName), value: widgetName}));
        },
        onChangeValue: function (e) {
            const {onChange} = this.props;
            let value = $(e.currentTarget).val();
            this.setState({value: value});
            if (onChange) {
                onChange(value);
            }
        },
        bindAction: function () {
            this.$el.find("select").change(this.onChangeValue.bind(this));
            this.$el.find("select").val(this.getValue());
        }
    });


    var Condition = WidgetBase.extend({
        template: "Edit.Field.Condition",
        init: function (parent, params) {
            this._super(parent, params);
        },
        _renderEditUI: function () {

        },
        _renderCodeEdit: function () {
            const {value} = this.props;
            this.inputEdit = new Input(this, {...this.props, label: "# Code editor  (enter to save)", value: value || "[]"});
            this.inputEdit.renderElement();
            this.$el.find("._ecCodeEdit").append(this.inputEdit.$el);
        },
        renderElement: function () {
            this._super();
            this._renderEditUI();
            this._renderCodeEdit();
        }
    });

    var CBCondition = WidgetBase.extend({
        template: "Edit.Field.CBCondition",
        init: function (parent, params) {
            this._super(parent, params);
            this.state = {show: false, value: params.value || false}
        },
        toggleCondition: function (e) {
            e.stopPropagation();
            const {show} = this.state;
            this.setState({show: !show});
            this.$el.find("._editCondition")[!show ? "addClass" : "removeClass"]("show");
        },
        getData: function () {
            const {value} = this.state;
            return this.checkValue(value) ? value : this.ref.checkbox.getValue();
        },
        checkValue: function (value) {
            if (["0", "1"].includes(value)) {
                return false;
            }
            let isCondition = (typeof value == "string" && value != "[]" && value.length) || (Array.isArray(value) && value.length);
            return isCondition;
        },
        onChangeValue: function (value) {
            const {onChange} = this.props;
            this.setState({value: value});
            this.bindStyle();
            if (onChange) {
                onChange(this.getData());
            }
        },
        onKeyUp: function (value) {
            this.setState({value: value});
            this.bindStyle();
        },
        bindStyle: function () {
            const {value} = this.state;
            let isCondition = this.checkValue(value);
            this.ref.checkbox.$el[isCondition ? "addClass" : "removeClass"]("_useCondition");
            this.ref.checkbox.readonly = isCondition;
        },
        bindAction: function () {
            this.$el.find("._wCbCon > span").click(this.toggleCondition.bind(this));
        },
        renderView: function () {
            const {value} = this.state;
            this.ref.condition = new Condition(this, {...this.props, onChange: this.onChangeValue.bind(this),
                value: Array.isArray(value) ? JSON.stringify(value) : "[]"});
            this.ref.checkbox = new Checkbox(this, {...this.props, value: value, onChange: this.onChangeValue.bind(this)});
            this.ref.condition.renderElement();
            this.ref.checkbox.renderElement();
            this.$el.find("._wCbCon").append(this.ref.checkbox.$el).append("<span>Condition</span>");
            this.$el.find("._wEditCon").append(this.ref.condition.$el);
        },
        renderElement: function () {
            this._super();
            this.renderView();
            this.bindStyle();
            this.bindAction();
        }
    });

    var WidgetOption = WidgetBase.extend({
        template: "Edit.Field.Widget",
        init: function (parent, params) {
            this._super(parent, params);
            this.state = {value: params.value || false}
        },
        start: function () {
            this.fieldsWidget = this.prepareData();
        },
        getValue: function () {
            return this.state.value;
        },
        capitalize: function (name) {
            return name.split("_").map((str) => str.charAt(0).toUpperCase() + str.slice(1)).join(" ");
        },
        prepareData: function () {
            const {fieldType} = this.props;
            return Object.keys(FieldRegistry.map).filter((widgetName) => {
                let widget = FieldRegistry.map[widgetName], {supportedFieldTypes} = widget.prototype;
                return supportedFieldTypes && supportedFieldTypes.includes(fieldType || "char");
            }).map((widgetName) => ({label: this.capitalize(widgetName), value: widgetName}));
        },
        onChangeValue: function (e) {
            const {onChange} = this.props;
            let value = $(e.currentTarget).val();
            this.setState({value: value});
            if (onChange) {
                onChange(value);
            }
        },
        bindAction: function () {
            this.$el.find("select").change(this.onChangeValue.bind(this));
            this.$el.find("select").val(this.getValue());
        }
    });

    var Groups = Widget.extend(StandaloneFieldManagerMixin, {
        template: "Edit.Field.Groups",
        init: function (parent, params) {
            const {value} = params;
            this._super(parent);
            this.props = params;
            this.model = new BasicModel(new Widget());
            StandaloneFieldManagerMixin.init.call(this);
            this.state = {value: value};
        },
        _confirmChange: function (id, fields, event) {
            this.onChangeData(id);
            return StandaloneFieldManagerMixin['_confirmChange'].apply(this, arguments);
        },
        getGroupId: function () {
            const {value} = this.state;
            if (Array.isArray(value)) {
                return this['_rpc']({
                    model: "res.groups",
                    method: 'search_read',
                    fields: ['id', 'display_name'],
                    domain: [['id', 'in', value]],
                }).then(function (result) {
                    return result;
                });
            }
            if (!value) {
                return $.Deferred().resolve([]);
            }
            return this['_rpc']({
                model: "odo.studio",
                method: 'get_group_id',
                args: [value],
                kwargs: {},
            }).then(function (result) {
                return result;
            });
        },
        onChangeData: function (id) {
            const {onChange, typeResult} = this.props, record = this.model.get(id);
            if (typeResult == "id") {
                return onChange(record.data.groups.res_ids);
            }
            this['_rpc']({
                model: "odo.studio",
                method: 'get_group_xmlid',
                args: [record.data.groups.res_ids],
                kwargs: {},
            }).then(function (result) {
                onChange(result);
            });
        },
        renderView: function () {
            let self = this;
            this.getGroupId().then((value) => {
                self.model.makeRecord("ir.model.fields", [{
                    name: "groups",
                    string: "Groups",
                    relation: "res.groups",
                    type: 'many2many',
                    value: value,
                }]).then((recordID) => {
                    var record = self.model.get(recordID);
                    record.data.groups.fieldsInfo.default.id = {name: "id"};
                    record.data.groups.fieldsInfo.default.display_name = {name: "display_name"};
                    let many2one = new RelationalFields.FieldMany2ManyTags(self, "groups", record, {mode: 'edit'});
                    self._registerWidget(recordID, 'groups', many2one);
                    many2one.appendTo(self.$el.find("._wEditCon"));
                });
            });
        },
        renderElement: function () {
            this._super();
            this.renderView();
        }
    });

    var Relation = Widget.extend(StandaloneFieldManagerMixin, {
        template: "Edit.Field.Relation",
        init: function (parent, params) {
            const {value} = params;
            this._super(parent);
            this.props = params;
            this.model = new BasicModel(new Widget());
            StandaloneFieldManagerMixin.init.call(this);
            this.state = {value: value};
        },
        _confirmChange: function (id, fields, event) {
            this.onChangeData(id);
            return StandaloneFieldManagerMixin['_confirmChange'].apply(this, arguments);
        },
        getRelationValue: function () {
            const {value} = this.state;
            if (Array.isArray(value) && value.length) {
                return $.Deferred().resolve({id: value[0], display_name: value[1]});
            }
            if (!value) {
                return $.Deferred().resolve({});
            }
            return this['_rpc']({
                model: "odo.studio",
                method: 'get_relation_id',
                args: [value],
                kwargs: {},
            }).then(function (result) {
                return result;
            });
        },
        getValue: function () {
            return this.state.value;
        },
        onChangeData: function (id) {
            const self = this, {onChange, relation, name} = this.props, record = this.model.get(id);
            this['_rpc']({
                model: relation,
                method: 'read',
                args: [record.data[name].res_id],
                kwargs: {},
            }).then(function (result) {
                if (result && result.length) {
                    self.state.value = result[0].id;
                    onChange(result[0]);
                }
            });
        },
        renderView: function () {
            let self = this;
            const {name, label, relation} = this.props;
            this.getRelationValue().then((value) => {
                self.model.makeRecord(name, [{
                    name: name,
                    string: label || "Relation",
                    relation: relation,
                    type: 'many2one',
                    value: value.id,
                }]).then((recordID) => {
                    var record = self.model.get(recordID);
                    let many2one = new RelationalFields.FieldMany2One(self, name, record, {
                        mode: 'edit',
                        noOpen: true
                    });
                    self._registerWidget(recordID, name, many2one);
                    many2one.appendTo(self.$el.find("._wEditCon"));
                });
            });
        },
        renderElement: function () {
            this._super();
            this.renderView();
        }
    });

    var ColorLine = Widget.extend({
        template: "ViewEdit.ColorLine",
        init: function (parent, params) {
            const {value} = params;
            this.props = params;
            this.oldVal = value || {};
            this.state = {value: value || {}};
            this.viewInfo = {danger: {}, warning: {}, success: {}, primary: {}, info: {}, muted: {}, bf:
                    {placeholder: "Bold"}, it: {placeholder: "Italic"}};
        },
        setState: function (params) {
            Object.keys(params).map((name) => {
                this.state[name] = params[name];
            });
        },
        getValue: function () {
            return this.state.value;
        },
        setValue: function (value) {
            this.setState({value: value});
        },
        onKeyUp: function (e) {
            let self = this;
            const {onChange} = this.props, {value} = this.state;
            let el = $(e.currentTarget), name = el.attr("name"), newVal = {...value, [name]: el.val()} ;
            this.setState({value: newVal});
            if (onChange && e.keyCode == 13) {
                this.oldVal = newVal;
                onChange(newVal);
            }
            Object.keys(newVal).map((colorName) => {
                let oldVal = self.oldVal[colorName];
                self.$el.find("div[name='"+colorName+"']")[oldVal != newVal[colorName] ? "addClass" : "removeClass"]("_oSave");
            });
        },
        bindAction: function () {
            this.$el.find('._lColor input').keyup(this.onKeyUp.bind(this));
        },
        reload: function () {
            this.renderElement();
        },
        renderElement: function () {
            this._super();
            this.bindAction();
        }
    });

    var WidgetFieldArray = Widget.extend({
        template: "EditReport.Widget.Array",
        init: function (parent, params) {
            this._super(parent);
            this.props = params;
            const {value} = this.props;
            this.options = {};
            this.state = {data: value || []};
        },
        onRemoveVal: function (value) {
            const {data} = this.state, idxRemove = data.indexOf(value), {onChange} = this.props;
            data.splice(idxRemove, 1);
            onChange(data);
            this.renderValue();
            this.renderOptions();
        },
        renderOptions: function () {
            const {options} = this.props, {data} = this.state;
            this.$el.find(".wOp").empty();
            options.map((option) => {
                if (!data.includes(option)) {
                    let optionObj = {label: option, value: option},
                        elItem = $(QWeb.render("EditReport.Widget.Array.option", optionObj));
                    elItem.click(() => this.onClickItem(optionObj));
                    this.options[option] = optionObj;
                    this.$el.find(".wOp").append(elItem);
                }
            });
        },
        renderValue: function () {
            const {data} = this.state;
            this.$el.find(".wV").empty();
            data.map((value) => {
                let elValue = $(QWeb.render("EditReport.Widget.Array.value", {label: value, value: value}));
                elValue.find(".removeVal").click(() => this.onRemoveVal(value))
                this.$el.find(".wV").append(elValue);
            });
        },
        onClickItem: function (option) {
            const {data} = this.state, {onChange} = this.props;
            data.push(option.value);
            onChange(data);
            this.renderValue();
            this.renderOptions();
        },
        toggle: function () {
            let wOption = this.$el.find(".wOp");
            wOption.hasClass("show") ? wOption.removeClass("show") : wOption.addClass("show");
        },
        bindAction: function () {
            this.$el.find(".wSl").click(this.toggle.bind(this));
        },
        renderElement: function () {
            this._super();
            this.renderValue();
            this.renderOptions();
            this.bindAction();
        }
    });

    var SelectFieldModel = Widget.extend({
        template: "EditReport.ModelFieldSelector",
        init: function (parent, params) {
            this._super(parent, params);
            this.props = params;
        },
        capitalizeFirstLetter: function(str) {
          return str.charAt(0).toUpperCase() + str.slice(1);
        },
        prepareFields: function () {
            const {dataRoot} = this.props, fields = [];
            if (dataRoot) {
                Object.keys(dataRoot).map((fName) => {
                    let field = {name: fName, string: fName}, fieldType = dataRoot[fName], strField = fieldType;
                    if (fieldType.indexOf(".") > 0) {
                        field.relation = fieldType;
                        field.type = "many2one";
                        strField = strField.split(".").map((f) => this.capitalizeFirstLetter(f)).join(" ")
                    }
                    field.string = `${fName} (${strField})`;
                    fields.push(field);
                })
            }
            return fields;
        },
        renderFieldSelector: async function () {
            const {modelName, chain, onChange, options} = this.props;
            let fsOptions = Object.assign(options || {}, {readonly: false, editReport: true,
                fields: this.prepareFields(), onChange: onChange});
            this.fieldSelector = new ModelFieldSelector(this, null, chain, fsOptions);
            await this.fieldSelector.appendTo(this.$el.find(".mfsC"));
        },
        renderElement: function () {
            this._super();
            this.renderFieldSelector();
        }
    });

    var ReportPropertyWidget = Widget.extend({
        template: "EditReport.NodeProperty.Widget",
        init: function (parent, params) {
            this._super(parent, params);
            this.props = params;
            this.options = {};
            this.prepareOptions();
        },
        prepareOptions: function () {
            const {fieldNode} = this.props.data, {widgetOptions} = fieldNode;
            if (Object.keys(widgetOptions).length && widgetOptions.widget) {
                this.options = widgetOptions;
            }
        },
        onChangeWidget: function (widgetName) {
            this.renderWidgetOptions(widgetName)
        },
        onChangeOption: function (optionName, optionValue) {
            const {onChange} = this.props;
            if (optionValue === true) {
                optionValue = "true";
            }
            if (optionValue === false) {
                optionValue = "false";
            }
            this.options[optionName] = optionValue;
            onChange({name: "options", value: JSON.stringify(this.options)});
        },
        preValOption: function (val) {
            if (val == "true") {
                val = true;
            }else if (val == "false") {
                val = false;
            }
            return val;
        },
        renderWidgetOptions: function (widgetName, optionsValue={}) {
            const {widgets, dataRoot} = this.props, widget = widgets[widgetName], options = Object.keys(widget),
                fieldWidgets = {string: Input, boolean: Checkbox, array: WidgetFieldArray, model: SelectFieldModel};
            this.$el.find("._eROpCon").empty();
            options.map((option) => {
                const {type, string, params, default_value} = widget[option];
                if (type && (type in fieldWidgets)) {
                    const props = {label: string, onChange: (value) => this.onChangeOption.bind(this)(option, value)};
                    if (type == "array") {
                        props.options = params.params || default_value;
                    }else if (type == "model") {
                        props.modelName = params;
                        props.chain = [];
                        props.dataRoot = dataRoot;
                    }
                    if (option in optionsValue) {
                        props.value = this.preValOption(optionsValue[option]);
                    }
                    let fieldWidget = new fieldWidgets[type](this, props);
                    fieldWidget.renderElement();
                    this.$el.find("._eROpCon").append(fieldWidget.$el);
                }
            });
        },
        renderWidget: function () {
            const {widgets, data} = this.props, nameWidgets = Object.keys(widgets),
                selectData = nameWidgets.map((name) => {
                    return {label: name, value: name}
                });
            const {fieldNode} = data, {widget} = fieldNode.widgetOptions,
                propsSelect = {data: selectData, label: "Widget", value: widget || false, onChange: this.onChangeWidget.bind(this)};
            let widgetSelect = new Selection(this, propsSelect);
            widgetSelect.renderElement();
            this.$el.find('._eRWidCon').append(widgetSelect.$el);
            if (widget) {
                this.renderWidgetOptions(widget, fieldNode.widgetOptions);
            }
        },
        renderElement: function () {
           this._super();
           this.renderWidget();
        }
    });

    var ParentElNode = Widget.extend({
        template: "EditReport.ParentElNode",
        init: function (parent, params) {
            this._super(parent, params);
            this.props = params;
            const {elNode, data} = this.props;
            this.state = {activeEl: elNode, elProps: data};
        },
        onClickItem: function (item, el) {
            const {preparePropertyNode, onClickEl} = this.props;
            if (preparePropertyNode) {
                let elProps = preparePropertyNode(el[0]);
                if (onClickEl) {
                    onClickEl(el);
                }
                this.state.activeEl = el;
                this.state.elProps = elProps;
                this.renderElement();
            }
        },
        getPath: function (elNode) {
            return elNode.attr("data-oe-xpath") || elNode.attr("path-xpath");
        },
        getElParent: function (elNode, listEl) {
            if (elNode) {
                let tagName = elNode[0].tagName.toLowerCase(), itemProps = {tagName: tagName, path: this.getPath(elNode)};
                if (tagName == "div") {
                    itemProps.icon = "fa fa-folder";
                }else if (tagName == "table") {
                    itemProps.icon = "fa fa-table";
                }else if (["tbody", "thead", "tr"].includes(tagName)) {
                    itemProps.icon = "fa mt4 fa-ellipsis-h";
                }else if (["th", "td"].includes(tagName)) {
                    itemProps.icon = "fa mt4 fa-square-o";
                }
                let item = $(QWeb.render("Report.NodeTemplate.Item", itemProps)), parentEl = elNode.parent();
                item.find(".itHead").click(() => this.onClickItem.bind(this)(item, elNode));
                listEl.push(item);
                if (parentEl.length && parentEl[0].tagName.toLowerCase() != "main") {
                    this.getElParent(parentEl, listEl);
                }
            }
        },
        setElProps: function (elProps) {
            this.state.elProps = elProps;
            this.renderEl();
        },
        renderEl: function () {
            const {elNode} = this.props, {activeEl} = this.state;
            if (elNode) {
                let listEl = [], width = 5, wTemplate = $("<div class='wTpl'>");
                this.getElParent(elNode, listEl);
                listEl = listEl.reverse();
                listEl.map((el) => {
                    el.find(".sI").css({width: width+"px"});
                    el.find("h5").css({marginLeft: width+"px"});
                    width += 3;
                });
                this.$el.append(wTemplate.append(listEl));
                this.renderPropsElActive(activeEl);
            }
        },
        renderPropsElActive: function () {
            const {elProps, activeEl} = this.state;
            let nodeProperty = new ReportProperty(this, Object.assign(this.props, {data: elProps})), path = this.getPath(activeEl);
            nodeProperty.renderElement();
            if (path) {
                this.$el.find(`.tplItem[path="${path}"]`).addClass("active").find(".itProps").append(nodeProperty.$el);
                // this.$el.find(`.tplItem[path="${path}"] .itProps`).append(nodeProperty.$el);
            }else {
                this.$el.append(nodeProperty.$el);
            }
        },
        renderElement: function () {
            this._super();
            this.renderEl();
        }
    });

    var ReportProperty = Widget.extend({
        template: "EditReport.NodeProperty",
        init: function (parent, params) {
            this._super(parent, params);
            this.props = params;
            const {data, elNode} = this.props;
            this.oldVal = data;
            this.state = {data: data};
        },
        setState: function (params) {
            Object.keys(params).map((name) => {
                this.state[name] = params[name];
            });
        },
        onKeyUp: function (e) {
            const {onChange} = this.props, el = $(e.currentTarget), type = el.attr("data"), value = el.val(), data = this.state.data;
            this.setState({...data, [type]: value});
            if (onChange && e.keyCode == 13) {
                this.oldVal[type] = value;
                onChange({name: type, value: value});
            }
            el[this.oldVal[type] != value ? "addClass" : "removeClass"]("_oSave");
        },
        getPadMar: function (pmType) {
            const {data} = this.state;
            if (pmType in data) {
                return data[pmType].replace(" ", "").replace("px", "").replace("!important", "");
            }
            return null
        },
        onClickA: function (e) {
            const {onChange} = this.props, self = this;
            let el = $(e.currentTarget), elType = el.attr("type");
            if (elType == "text-decoration") {
                let objProps = {};
                if (el.hasClass("active")) {
                    objProps.remove = true
                }
                if (el.hasClass("fontStyle")) {
                    objProps.name = 'font-style';
                    objProps.value = "italic";
                } else if (el.hasClass("textUnderline")) {
                    objProps.name = 'text-decoration';
                    objProps.value = "underline";
                } else if (el.hasClass("fontWeight")) {
                    objProps.name = 'font-weight';
                    objProps.value = "bold";
                }
                onChange(objProps);
            }
            if (["text-align"].includes(elType)) {
                let elData = el.attr("data").replace(" ", "");
                onChange({name: elType, value: elData});
            }else if (["color", "background"].includes(elType)) {
                const dialog = new colorPickerDialog(this, {
                    defaultColor: "#cdcdcd",
                    noTransparency: true,
                }).open();
                dialog.on('colorpicker:saved', this, function (ev) {
                    onChange({name: elType, value: ev.data.cssColor});
                });
                dialog.on('closed', this, () => {
                    Promise.resolve().then(() => {
                    });
                });
            }
        },
        setStyle: function () {
            const {textAlign, textUnderline, fontWeight, fontStyle, color, background} = this.state.data;
            let align = textAlign;
            if (textAlign.indexOf("right") >= 0) {
                align = "right";
            }
            if (textAlign.indexOf("left") >= 0) {
                align = "left";
            }
            if (textAlign.indexOf("center") >= 0) {
                align = "center";
            }
            if (align) {
                this.$el.find("a[type='text-align']").removeClass("active");
                this.$el.find(`.textAlign-${align}`).addClass("active");
            }
            if (color) {
                this.$el.find("a[type='color'] i").css({color: color});
            }
            if (background) {
                this.$el.find("a[type='background'] i").css({color: background});
            }
            this.$el.find(".textUnderline").addClass(textUnderline ? "active" : "no_active");
            this.$el.find(".fontWeight").addClass(fontWeight ? "active" : "no_active");
            this.$el.find(".fontStyle").addClass(fontStyle ? "active" : "no_active");
        },
        bindAction: function () {
            this.$el.find('input').keyup(this.onKeyUp.bind(this));
            this.$el.find('a').click(this.onClickA.bind(this))
        },
        renderNodeData: function () {
            const {fieldNode, escNode, text} = this.state.data;
            if (fieldNode) {
                this.renderSelectField();
            }else if (escNode || text) {
                let input = $("<input />");
                input.attr({data: escNode ? "esc" : "text", value: escNode || text});
                this.$el.find("._rowPp.lR0").append(input);
            }
        },
        renderWidget: function () {
            let propWidget = new ReportPropertyWidget(this, this.props);
            propWidget.renderElement();
            this.$el.find('._rowPp.lR0').append(propWidget.$el);
        },
        renderSelectField: async function () {
            const {fieldNode} = this.state.data;
            if (fieldNode) {
                const {chain} = fieldNode;
                const {dataRoot, onChange} = this.props;
                var fieldSelector = new SelectFieldModel(this, {onChange: (data) => onChange({name: "field", value: data}), chain: chain, dataRoot: dataRoot, modelName: null});
                fieldSelector.renderElement();
                this.$el.find('._rowPp.lR0').append(fieldSelector.$el);
                this.renderWidget();
            }
        },
        renderVisibleFor: function () {
            const {groups} = this.state.data, {onChange} = this.props;
            let groupsView = new Groups(this, {onChange: onChange, value: groups});
            groupsView.renderElement();
            this.$el.find('._rowPp.lR4').append(groupsView.$el);
        },
        renderElement: function () {
            this._super();
            this.renderVisibleFor();
            this.renderNodeData();
            this.bindAction();
            this.setStyle();
        }
    });

    var ViewMoreView = Widget.extend({
        template: "ViewEdit.ViewMore",
        init: function (parent, params) {
            this._super(parent, params);
            this.props = params;
            this.newField = params.node.newField || false;
        },
        onClickShow: function (e) {
            let self = this;
            const {node} = this.props, {name} = node.attrs, {viewInfo} = this.getParent().props;
            this['_rpc']({
                model: "odo.studio",
                method: 'get_field_id',
                args: [name, viewInfo.model]
            }).then(function (fieldId) {
                self.do_action({
                    name: "Change Field Property",
                    type: 'ir.actions.act_window',
                    res_id: fieldId,
                    readonly: false,
                    mode: "edit",
                    res_model: "ir.model.fields",
                    views: [[false, 'form']],
                    target: 'new',
                    context: {},
                }, () => {
                    alert("ok")
                });
            });
        },
        bindAction: function () {
            this.$el.find("button").click(this.onClickShow.bind(this));
        },
        renderElement: function () {
            this._super();
            this.bindAction();
        }
    })

    return {ViewMoreView: ViewMoreView, SelectFieldModel: SelectFieldModel, Relation: Relation, ColorLine: ColorLine, Groups: Groups, WidgetOption: WidgetOption, CBCondition: CBCondition, Condition: Condition,
        RadioWidget: RadioWidget, Char: Char, Integer: Integer, Many2one: Many2one, Selection: Selection,
        Many2manyTagCheckbox: Many2manyTagCheckbox, Radio: Radio, Checkbox: Checkbox, GroupRadio: GroupRadio,
        GroupCheckBox: GroupCheckBox, Input: Input, Tab: Tab, Button: Button, TextArea: TextArea, ParentElNode: ParentElNode}
});
