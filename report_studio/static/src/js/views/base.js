odoo.define('report_studio.BaseEdit', function (require) {
"use strict";

    var core = require('web.core');
    var Widget = require('web.Widget');
    var FieldBasic = require('report_studio.FieldBasic');
    var fieldRegistry = require('web.field_registry');
    var mixins = require('web.mixins');
    var utils = require('web.utils');
    var QWeb = core.qweb;


    var WidgetBase = Widget.extend(mixins.EventDispatcherMixin, {
        init: function (parent, params) {
            this._super(parent, params);
            this.props = params;
            this.state = {};
            this.ref = {};
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
        reload: function () {
            this.renderElement();
        },
        renderElement: function () {
            this._beforeRender();
            this._super();
            this._afterRender();
        }
    });

    var EditBase = WidgetBase.extend({
        init: function(parent, params) {
            this._super(parent, params);
            this.fieldsWidget = {
                datetime: {name: "datetime", label: "Datetime", icon: "fa-clock-o", widget: FieldBasic.Char},
                date: {name: "date", label: "Date", icon: "fa-calendar", widget: FieldBasic.Char},
                char: {name: "char", label: "Char", icon: "fa-font", widget: FieldBasic.Char},
                phone: {name: "phone", label: "Char", icon: "fa-font", widget: FieldBasic.Char},
                email: {name: "email", label: "Char", icon: "fa-font", widget: FieldBasic.Char},
                url: {name: "url", label: "Char", icon: "fa-font", widget: FieldBasic.Char},
                field_partner_autocomplete: {name: "field_partner_autocomplete", label: "Char", icon: "fa-font", widget: FieldBasic.Char},
                html: {name: "html", label: "Html", icon: "fa-file-code-o", widget: FieldBasic.TextArea},
                text: {name: "text", label: "Text", icon: "fa-arrows-alt", widget: FieldBasic.TextArea},
                many2one: {name: "many2one", label: "Many2one", icon: "", widget: FieldBasic.Many2one},
                res_partner_many2one: {name: "res_partner_many2one", label: "Many2one", icon: "", widget: FieldBasic.Many2one},
                // one2many: {name: "one2many", label: "One2many", icon: "fa-bars", widget: One2many},
                // section_and_note_one2many: {name: "section_and_note_one2many", label: "One2many", icon: "fa-bars", widget: One2many},
                many2many: {name: "many2many", label: "Many2many", icon: "fa-pagelines", widget: FieldBasic.Input},
                many2many_tags: {name: "many2many", label: "Many2many Tag", icon: "fa-pagelines", widget: FieldBasic.Input},
                many2many_checkboxes: {name: "many2many", label: "Many2many Checkbox", icon: "fa-pagelines", widget: FieldBasic.Many2manyTagCheckbox},
                integer: {name: "integer", label: "Integer", icon: "", widget: FieldBasic.Integer},
                float: {name: "float", label: "Float", icon: "fa-fire", widget: FieldBasic.Integer},
                monetary: {name: "monetary", label: "Monetary", icon: "fa-file", widget: FieldBasic.Integer},
                binary: {name: "binary", label: "Binary", icon: "fa-file", widget: FieldBasic.Input},
                selection: {name: "selection", label: "Selection", icon: "fa-file", widget: FieldBasic.Selection},
                boolean: {name: "boolean", label: "Boolean", icon: "fa-check-square", widget: FieldBasic.Checkbox},
                radio: {name: "radio", label: "Radio", icon: "fa-check-square", widget: FieldBasic.RadioWidget},
            };
        },
        start: function () {
            const {viewInfo, _processFieldsView, view, nodeId} = this.props, {viewFields, fieldsGet} = viewInfo;
            this.viewInfo = viewInfo || {};
            this.nodeId = nodeId || false;
            this.view = view || {};
            this.sortData = [];
            let fieldsCheck = fieldsGet || viewFields;
            this.viewFields = Object.keys(fieldsCheck).map(
                (fieldName) => ({...fieldsCheck[fieldName], name: fieldName}));
            this._processFieldsView = _processFieldsView;
        },
        xpathNode: function (nodeId, oldParentId, parentNodeId, node, position) {
            this.ref.content.xpathToNode(nodeId, oldParentId, parentNodeId, node, position);
        },
        getNewChatter: function () {
            return this.ref.content.getNewChatter({});
        },
        prepareNewField: function () {
            const newField = this.ref.content.newField || {}, modelName = this.viewInfo.model;
            return Object.values(newField).map((field) => {
                const {name, string, type, help, required, readonly, relation, relation_field, selection} = field.attrs;
                let valField = {name: name, field_description: string, ['t_type'.replace("_", "")]: type,
                    help: help, required: required || false, readonly: readonly || false};
                if (["many2many", "one2many", "many2one"].includes(type)) {
                    if (!relation) {
                        alert("Pls choose Relation field. Thanks !");
                        return false;
                    }
                    if (type == "one2many") {
                        if (!relation_field) {
                            alert("Pls Choose Relation field. Thanks !");
                            return false;
                        }
                        let fieldM2one = {model_name: relation, relation: modelName, name: relation_field,
                            ['t_type'.replace("_", "")]: "many2one", field_description: "Field Relation"};
                        valField.fieldM2one = fieldM2one;
                        valField.relation_field = relation_field;
                    }
                    valField.relation = relation;
                } else if (type == "selection") {
                    if (!selection) {
                        alert("Pls Fill Selection field. Thanks !");
                        return false;
                    }
                    valField.selection = selection;
                }
                return valField;
            });
        },
        getData: function () {
            const {viewInfo} = this.props, {view_id, model} = viewInfo;
            return {xml: this.ref.content.jsonToXml(), view_id: view_id, new_fields: this.prepareNewField(), model_name: model};
        },
        jsonToXml: function (arch) {
            return utils["json_node_to_xml"](arch);
        },
        onCloseSubView: function (nodeId, viewType) {},
        getSubViewData: function (nodeId, viewType) {
            const {model, view_id} = this.viewInfo;
            const fieldInfo = this.ref.content.getSubView(nodeId), subViewInfo = fieldInfo.views[viewType], dataUpdate = {};
            dataUpdate.view_key = [model, "field", fieldInfo.name, viewType].join("_");
            dataUpdate.view_id = subViewInfo.view_id || false;
            dataUpdate.view_type = viewType == "list" ? "tree" : viewType;
            dataUpdate.field_name = fieldInfo.name;
            dataUpdate.parent_model_name = model;
            dataUpdate.parent_view_id = view_id || false;
            dataUpdate.xml = this.jsonToXml(subViewInfo.arch);
            return dataUpdate;
        },
        onClickNode: function (node) {
            this.ref.property.renderProperty(node);
        },
        onRemoveNode: function () {
            const nodeId = this.ref.property.getCurrentNode();
            if (nodeId) {
                this.ref.content.onRemoveNode(nodeId);
                let node = this.ref.content.nodes[nodeId];
                if (node.tag == "field") {
                    const {fieldsInfo, type} = this.props.viewInfo, fieldName = node.attrs.name;
                    if (fieldName in fieldsInfo[type]) {
                        delete fieldsInfo[type][fieldName];
                        this.ref.property.reload();
                    }
                }
            }
        },
        onChangeAttr: function (node) {
            // this.ref.content.formView._reloadNode(node.nodeId);
            this.ref.content.reloadNode(node.nodeId || node);
        },
        stopSort: function (el) {
            let self = this, elType = el.attr("type");
            const {content} = this.ref;
            // el.removeClass("_sortItem");
            if (el.parents(".editList, ._wFormCon").length) {
                let prev = el.prev(), next = el.next(), parent = el.parents("[node-id]"), nodeCheck = parent;
                let parentNodeId = parent.attr("node-id"), oldParentId = el.attr("parent-id"), nodeId = parentNodeId,
                    tagName = el.attr("name"), position =false, params = {};
                if (prev.length) {
                    nodeCheck = prev;
                    position = "after";
                    if (!content.getNodeId(nodeCheck) && next.length) {
                        nodeCheck = next;
                        position = "before";
                    }
                }else if (next.length) {
                    nodeCheck = next;
                    position = "before";
                }
                if (nodeCheck.length) {
                    nodeId = content.getNodeId(nodeCheck);
                }
                if (elType) {
                    switch (elType) {
                        case "field":
                            params.fieldName = tagName;
                            tagName = "field";
                            break;
                        case "fieldNew":
                            params.fieldType = tagName;
                            tagName = "field";
                            break;
                    }
                    content.renderNewNode(nodeId, parentNodeId, tagName, position, params);
                    if (['component', 'fieldNew'].includes(elType)) {
                        self.ref.property.ref.tab._renderTabContent(true);
                    }
                }else {
                    let currNodeId = content.getNodeId(el);
                    if (currNodeId in content.nodes) {
                        content.xpathToNode(nodeId, oldParentId, parentNodeId, content.nodes[currNodeId], position);
                    }
                }
                el.remove();
            }
        },
        sortMove: function (ui) {
            // ui.helper.css({height: "auto", width: "max-content"});
            let itemType = ui.item.attr("type");
            if (ui.placeholder.parents("._wFormCon").length) {
                ui.placeholder.css({height: `${ui.item.height()}px`});
                ui.placeholder.attr({type: itemType}).addClass("placeholderForm");
            }
            if (ui.placeholder.parents(".tblList").length) {
                ui.placeholder.css({minWidth: ui.item.width() + "px", maxWidth: ui.item.width() + "px"});
            }
            // if (["field", "newField", "component"].includes(itemType)) {
            //     ui.helper.addClass("_sortItem");
            // }
        },
        beforeApplySort: function (el) {},
        startSort: function (ui) {
            let currParent = ui.item.parents("[node-id]").attr("node-id");
            if (currParent) {
                ui.item.attr({"parent-id": currParent});
            }
        },
        disableSort: function () {
            let self = this;
            this.sortData.map((data) => {
                self.ref.content.$el.find(data[0]).sortable("disable");
            });
        },
        enableSort: function () {
            let self = this;
            this.sortData.map((data) => {
                self.ref.content.$el.find(data[0]).sortable("enable");
            });
        },
        bindSortable: function (el) {
            let self = this;
            this.beforeApplySort(el);
            this.sortData.map((data) => {
                el.find(data[0]).sortable({
                    connectWith: data[1],
                    sort: function (event, ui) {
                        self.sortMove(ui);
                    },
                    start: function (event, ui) {
                        self.startSort(ui);
                    },
                    stop: function (event, ui) {
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                        self.stopSort(ui.item);
                    }
                }).disableSelection();
            });
        },
        _prepareParamContent: function () {
            return {...this.props, fieldsWidget: this.fieldsWidget, onClickNode: this.onClickNode.bind(this),
                bindSortable: this.bindSortable.bind(this)}
        },
        _prepareParamProperty: function () {
            return {
                ...this.props,
                viewInfo: this.viewInfo,
                viewFields: this.viewFields,
                fieldsWidget: this.fieldsWidget,
                xpathNode: this.xpathNode.bind(this),
                bindSortable: this.bindSortable.bind(this),
                onChangeAttr: this.onChangeAttr.bind(this),
                getNewChatter: this.getNewChatter.bind(this),
            }
        },
        _renderContent: function (reload=false) {
            const {content} = this.view;
            if (!this.ref.content || (this.ref.content && reload)) {
                this.ref.content = new content(this, this._prepareParamContent());
                this.ref.content.renderElement();
            }
            return this.ref.content.$el;
        },
        _renderProperty: function (reload=false) {
            const {reloadProperty} = this.props,  {property} = this.view;
            if (!this.ref.property || (this.ref.property && reload)) {
                this.ref.property = new property(this, this._prepareParamProperty());
                this.ref.property.renderElement();
                if (reloadProperty && reload) {
                    reloadProperty();
                }
            }
            return this.ref.property.$el;
        },
        renderElement: function () {
            this._super();
        }
    });

    var ContentBase = WidgetBase.extend({
        init: function (parent, params) {
            this._super(parent, params);
        },
        start: function () {
            this.nodes = {};
            this.newField = {};
            this.nodeStore = {};
            this.nodeStore.field = this.getNewNoteField.bind(this);
            this.nodeStore.notebook = this.getNewNotebook.bind(this);
            this.nodeStore.group = () => this.getNewGroup.bind(this)({childSize: 2});
        },
        getSubView: function (nodeId) {
            const subNode = this.nodes[nodeId], nodeName = subNode.attrs.name,
                {fieldsInfo} = this.viewState || this.props.viewInfo, fieldInfo = fieldsInfo.form[nodeName];
            return fieldInfo;
        },
        jsonToXml: function () {
            return utils["json_node_to_xml"](this.props.viewInfo.arch);
        },
        prepareData: function () {
            let data = {view_id: 1, xml: this.jsonToXml()};
            return data;
        },
        findNode: function (nodeId) {
            return this.$el.find("[node-id='"+nodeId+"']");
        },
        reloadNode: function (nodeId) { // node || nodeId
            // this.ref.content._reloadNode(nodeId);
            // this.bindAction();
        },
        getNewGroup: function (params={}) {
            const {childSize} = params;
            let newGroup = {tag: "group", children: []};
            newGroup.attrs = {name: "new_group_"+moment().unix(), modifiers: {}};
            if (childSize) {
                _.times(childSize, () => {
                    newGroup.children.push(this.getNewGroup())
                });
            }
            return newGroup;
        },
        getNewChatter: function (params={}) {
            let newChatter = {tag: "div", children: []};
            newChatter.attrs = {class: "oe_chatter"};
            [{name: "message_follower_ids", widget: "mail_followers"}, {name: "activity_ids", widget: "mail_activity"},
                {name: "message_ids", widget: "mail_thread"}].map((field) => {
                let newNode = this.nodeStore["field"]({fieldName: field.name});
                newNode.attrs.widget = field.widget;
                this._processNewNode(newNode);
                newChatter.children.push(newNode);
            });
            return newChatter
        },
        getNewPage: function (params={}) {
            let newPage = {tag: "page"};
            newPage.attrs = {string: "New Page", name: "new_page_"+moment().unix()};
            newPage.children = [this.getNewGroup({childSize: 2})];
            return newPage;
        },
        getNewNotebook: function (params={}) {
            let newNotebook = {tag: "notebook"};
            newNotebook.attrs = {modifiers: {}};
            newNotebook.children = [this.getNewPage()];
            return newNotebook;
        },
        getNewNoteField: function (params={}) {
            const {fieldName, fieldType} = params, {viewInfo} = this.props, {fieldsGet, fieldsInfo, type} = viewInfo;
            let newField = {tag: "field"}, props = {modifiers: {}, name: fieldName};
            if (fieldType){
                props = {...props, type: fieldType, widget: fieldType, string: "New Field", name: "x_new_field_"+this.getRandom()};
                newField.newField = true;
                newField.fieldType = fieldType;
                this.newField[props.name] = newField;
            }else if (!(fieldName in fieldsInfo[type])) {
                const fieldInfo = fieldsGet[fieldName];
                props = {...props, widget: fieldInfo.type};
                newField.needWidget = true;
            }
            newField.attrs = props;
            newField.children = [];
            return newField;
        },
        getRandom: function () {
            return String(Math.random()).replace("0.", "PD");
        },
        getNodeAttr: function (node, attr) {
            const {name, modifiers} = node.attrs, field = this.props.viewInfo.fieldsGet[name];
            return (modifiers || {})[attr] || node.attrs[attr] || field[attr] || false;
        },
        _processNewNode: function (node) {
            const {viewInfo} = this.props, {fieldsGet} = viewInfo;
            [this.viewState || {}, viewInfo].map((_viewInfo) => {
                if (Object.keys(_viewInfo).length) {
                    const {viewType, type, fieldsInfo, fields} = _viewInfo, {name, widget} = node.attrs;
                    fieldsInfo[viewType || type][name] = _.clone(node.attrs);
                    fieldsInfo[viewType || type][name].Widget = fieldRegistry.getAny([viewType || type + "." + widget, widget]);
                    if (["many2many", "one2many"].includes(widget)) {
                        // let views = {}, arch = {tag: "tree"}, child = {tag: "field", children: []};
                        // arch.attrs = {modifiers: {}};
                        // child.attrs = {name: "id", modifiers: {}};
                        // arch.children = [child];
                        // views.arch = arch;
                        // views.fields = {id: {type: "integer", string: "ID"}};
                        // views.fieldsInfo = {list: {id: {name: "id", views: {}, modifiers: {}, Widget: fieldRegistry.getAny(["integer"])}}}
                        fieldsInfo[viewType || type][name].views = {};
                    }
                    if (node.needWidget && name in fieldsGet) {
                        fields[name] = fieldsGet[name];
                    } else {
                        fields[name] = node.attrs;
                    }
                }
            });
        },
        renderNewNode: function (nodeId, parentNodeId, tagName, position, params) {
            let newNode = this.nodeStore[tagName](params);
            if (newNode.newField || newNode.needWidget) {
                this._processNewNode(newNode);
            }
            this.xpathToNode(nodeId, false, parentNodeId, newNode, position);
        },
        setNodeId: function (node) {
            const nodeId = node.nodeId || "nodeId_" + this.getRandom();
            if (typeof node == 'object') {
                node.nodeId = nodeId;
            }
            this.nodes[nodeId] = node;
        },
        getNodeId: function (el) {
            let nodeId = el.attr("node-id");
            if (!nodeId && el[0].tagName.toLowerCase() == "tr") {
                let childNode = el.find("> td > *[node-id]");
                if (childNode.length) {
                    nodeId = $(childNode[childNode.length-1]).attr("node-id")
                }
            }
            return nodeId;
        },
        _checkLabelFor: function (node, name) {
            let res = node.tag == "field" && node.attrs.name == name;
            if (!res) {
                if (node.children && node.children.length) {
                    for (let i=0; i<node.children.length; i++) {
                        if (this._checkLabelFor(node.children[i], name)) {
                            res = true;
                            break;
                        }
                    }
                }
            }
            return res;
        },
        xpathToNode: function (nodeId, oldParentId, parentNodeId, node, position) {
            let parentNode = this.nodes[parentNodeId], nodeChildren = parentNode.children,
                indexInsert = nodeChildren.findIndex((child) => child.nodeId == nodeId);
            if (position == "replace") {
                nodeChildren.splice(indexInsert, 1);
            }else {
                if (oldParentId) {
                    let oldParent = this.nodes[oldParentId], oldNodeChild = oldParent.children,
                        nodeIdx = oldNodeChild.findIndex((child) => child.nodeId == node.nodeId);
                    oldNodeChild.splice(nodeIdx, 1);
                    if (node.tag !== "field") {
                        let labelIdx = oldNodeChild.findIndex((child) => child.tag == "label" && this._checkLabelFor(node, child.attrs.for));
                        if (labelIdx >= 0) {
                            let labelNode = oldNodeChild[labelIdx];
                            node = nodeIdx > labelIdx ? [labelNode, node] : [node, labelNode];
                            oldNodeChild.splice(labelIdx, 1);
                        }
                    }
                }
                if (!Array.isArray(node)) {
                    node = [node];
                }
                node.map((item) => item.parentId = parentNodeId);
                if (nodeId == parentNodeId || typeof nodeId == 'undefined') {
                    nodeChildren.push(...node);
                } else if (indexInsert >= 0) {
                    if (oldParentId == parentNodeId) {
                        let checkIdx = nodeChildren.findIndex((child) => child.nodeId == nodeId);
                        indexInsert -= indexInsert > checkIdx ? 1 : 0;
                    }
                    nodeChildren.splice(position == "after" ? (indexInsert + 1) : indexInsert, 0, ...node);
                }
            }
            if (parentNode.parentId && parentNode.tag == "group") {
                let stopCheck = false;
                while (!stopCheck) {
                    let _parentNode = this.nodes[parentNode.parentId]
                    if (_parentNode.tag !== 'group' || !_parentNode.parentId) {
                        parentNodeId = _parentNode.nodeId;
                        stopCheck = true;
                    }else if (_parentNode.tag == 'group' || _parentNode.parentId) {
                        parentNode = _parentNode;
                    }
                }
            }
            this.reloadNode(parentNodeId);
        },
        renderView: function () {},
        renderElement: function () {
            this._super();
            this.renderView();
        }
    });

    var PropertyBase = Widget.extend({
        template: 'FormViewEdit.Property',
        init: function (parent, params) {
            this._super(parent, params);
            const {columns, viewFields} = params;
            this.viewFields = viewFields || {};
            this.columns = columns || {};
            this.props = params;
            this.state = {tab: "fields", currentNode: false};
            this.fieldProperty = {ref: {}, data: {}};
            this.ref = {property: {}};
            this.start();
        },
        start: function () {
            let property = {}, view = {form: {}, tree: {}};
            this.tabs = {};
            this.tabs.fields = {label: "Fields", name: "fields", icon: "fa-foursquare", render: this._renderTabWField.bind(this)};
            this.tabs.property = {label: "Props", name: "property", icon: "fa-braille", render: this._renderTabProperty.bind(this)};
            this.tabs.component = {label: "Components", name: "component", icon: "fa-tags", render: this._renderTabComponent.bind(this)};
            this.components = {component: {label: "Tags", class: "_wComTag", type: "component"},
                fields: {label: "Fields", class: "_wComField", type: "fieldNew"}};
            this.block = {};
            this.block.child = {
                header: {name: "header", label: "Show Header"},
                chatter: {name: "chatter", label: "Show Chatter"}
            };
            this.components.component.child = {
                group: {name: "group", label: "Group"},
                notebook: {name: "notebook", label: "Notebook"}
            };
            this.components.fields.child = {
                datetime: {name: "datetime", label: "Datetime", icon: "fa-clock-o"},
                date: {name: "date", label: "Date", icon: "fa-calendar"},
                char: {name: "char", label: "Char", icon: "fa-font"},
                text: {name: "text", label: "Text", icon: "fa-arrows-alt"},
                many2one: {name: "many2one", label: "Many2one", icon: "fa-envira"},
                one2many: {name: "one2many", label: "One2many", icon: "fa-bars"},
                many2many: {name: "many2many", label: "Many2many", icon: "fa-pagelines"},
                integer: {name: "integer", label: "Integer", icon: "fa-yelp"},
                monetary: {name: "monetary", label: "Monetary", icon: "fa-modx"},
                float: {name: "float", label: "Float", icon: "fa-fire"},
                binary: {name: "binary", label: "Binary", icon: "fa-file"},
                selection: {name: "selection", label: "Selection", icon: "fa-file"},
                boolean: {name: "boolean", label: "Boolean", icon: "fa-check-square"},
            };
            property.required = {label: "Required", widget: FieldBasic.CBCondition};
            property.invisible = {label: "Invisible", widget: FieldBasic.CBCondition};
            property.readonly = {label: "Readonly", widget: FieldBasic.CBCondition};
            property.nolabel = {label: "No label", widget: FieldBasic.Checkbox};
            property.editable = {label: "Editable", widget: FieldBasic.Checkbox};
            property.duplicate = {label: "Duplicate", widget: FieldBasic.Checkbox};
            property.widget = {label: "Widget", widget: FieldBasic.WidgetOption};
            property.create = {label: "Create", widget: FieldBasic.Checkbox, default: true};
            property.delete = {label: "Delete", widget: FieldBasic.Checkbox, default: true};
            property.can_create = {label: "Can Create", widget: FieldBasic.Checkbox, default: true};
            property.quick_create = {label: "Quick Create", widget: FieldBasic.Checkbox, default: true};
            property.can_write = {label: "Can Write", widget: FieldBasic.Checkbox, default: true};
            property.search_advance = {label: "Search In Tree", widget: FieldBasic.Checkbox};
            property.showInvisible = {label: "Show all field Invisible", widget: FieldBasic.Checkbox};
            property.sticky = {label: "Sticky Header", widget: FieldBasic.Checkbox};
            property.serial = {label: "Serial Number", widget: FieldBasic.Checkbox};
            property.string = {label: "String", widget: FieldBasic.Input};
            property.domain = {label: "Domain", widget: FieldBasic.Input};
            property.relation = {label: "Relation", widget: FieldBasic.Relation, props: {relation: "ir.model", name: "relation"}};
            property.context = {label: "Context", widget: FieldBasic.Input};
            property.relation_field = {label: "Relation Field", widget: FieldBasic.Input, props: {placeholder: "Start with x_ (eg: x_new_field_id)"}};
            property.help = {label: "Help", widget: FieldBasic.Input};
            property.placeholder = {label: "Placeholder", widget: FieldBasic.Input};
            property.groups = {label: "Groups", widget: FieldBasic.Groups};
            property.more = {label: "More", widget: FieldBasic.ViewMoreView};
            property.selection = {label: "Placeholder", widget: FieldBasic.Input, props: {placeholder: "[('blue', 'Blue'), ('yellow', 'Yellow')]"}};
            property.color = {label: "Record Color", widget: FieldBasic.ColorLine};
            view.form.field = {};
            view.form.field.default = ["required", "invisible", "readonly", "nolabel", "string", "widget", "groups", "help", "placeholder", "context", "more"];
            view.form.field.char = ["required", "invisible", "readonly", "nolabel", "string", "widget", "groups", "help", "placeholder", "context", "more"];
            view.form.field.selection = ["required", "invisible", "readonly", "nolabel", "string", "widget", "groups", "selection", "help", "context", "more"];
            view.form.field.boolean = ["required", "invisible", "readonly", "nolabel", "string", "widget", "groups", "help", "context", "more"];
            view.form.field.binary = ["required", "invisible", "readonly", "nolabel", "string", "widget", "groups", "help", "context", "more"];
            view.form.field.many2one = ["required", "invisible", "readonly", "can_create", "can_write", "nolabel", "string", "relation", "widget", "groups", "help", "domain", "context", "more"];
            view.form.field.one2many = ["required", "invisible", "readonly", "nolabel", "string", "relation", "relation_field", "widget", "groups", "help", "context", "more"];
            view.form.field.many2many = ["required", "invisible", "readonly", "nolabel", "string", "relation", "widget", "groups", "help", "domain", "context", "more"];
            view.form.tree = ["showInvisible", "editable", "create", "delete", "string", "color", "more"];
            view.form.label = ["invisible", "string"];
            view.form.page = ["invisible", "string", 'groups'];
            view.form.group = ["invisible", "string"];
            view.form.form = ["showInvisible", "string"];
            view.form.button = ["invisible", "string"];
            view.tree.field = ["required", "invisible", "readonly", "string", "widget", "groups"];
            view.tree.tree = ["showInvisible", "editable", "search_advance", "create", "delete", "string", "color"];
            this.property = {property: property, view: view};
        },
        setState: function (params) {
            Object.keys(params).map((name) => {
                this.state[name] = params[name];
            });
        },
        bindAction: function () {
            this.$el.find("._ipSearch").keyup(this.onSearchField.bind(this));
        },
        onSearchField: function (e) {
            const {bindSortable, viewInfo} = this.props, fieldsInfo = viewInfo.fieldsInfo[viewInfo.type];
            let $el = $(e.currentTarget), val = $el.val(), fieldVisible = Object.keys(this.columns),
                _viewFields = this.viewFields.filter((field) => !(field.name in fieldsInfo)).filter((field) =>
                    !fieldVisible.includes(field.name) && (field.string || "").toLowerCase().includes(val.toLowerCase())),
                _wField = $(QWeb.render("ViewEdit.List.TCF.Fields", {viewFields: _viewFields})),
                wrapConC = this.ref.tab.$el.find('._wTConC');
            wrapConC.empty().append(_wField);
            bindSortable(wrapConC);
        },
        onPropertyChange: function (node, attr, valChange) {
            const {onChangeAttr} = this.props;
            if (["invisible", "required", "readonly"].includes(attr)) {
                if (typeof valChange == "string" && valChange.includes("[")) {
                    let valParse = JSON.parse(valChange);
                    valChange = valParse.length ? valParse : valChange;
                    node.attrs[attr] = valChange;
                }else {
                    node.attrs[attr] = valChange ? "1" : "0";
                }
                node.attrs.modifiers[attr] = valChange;
            }else if (["no_label".replace("_", "")].includes(attr)) {
                valChange = valChange ? "1" : "0";
                node.attrs[attr] = valChange;
            }else if (attr == "widget") {
                this.setNodeWidget(node, valChange);
                node.attrs[attr] = valChange;
            }else if (attr == "relation") {
                node.attrs[attr] = valChange.model;
            }else {
                node.attrs[attr] = valChange;
            }
            if (onChangeAttr) {
                onChangeAttr(node);
            }
        },
        setNodeWidget: function (node, widgetName) {
            const {viewType, type, fieldsInfo} = this.props.viewInfo, {name} = node.attrs, fieldInfo = fieldsInfo[viewType || type][name];
            fieldInfo.Widget = fieldRegistry.getAny([viewType || type + "." + widgetName, widgetName]);
            if (["many2many"].includes(fieldInfo.type) && !fieldInfo.views) {
                fieldInfo.views = {};
            }
        },
        prepareValue: function (attr, value, node) {
            // if (attr == "editable" && value) {
            //     value = true;
            // } else if (attr == "color") {
            //     value = {};
            //     ["success", "warning", "danger", "primary", "info", "muted", "bf", "it"].map((_attr) => {
            //         value[_attr] = node.attrs["decoration-"+_attr] || "";
            //     });
            // }
            return value;
        },
        renderProperty: function (node) {
            this.$el.find(".wLProP").empty().append(this._renderProperty(node));
        },
        getCurrentNode: function () {
            const {currentNode} = this.state;
            return currentNode;
        },
        _renderProperty: function (node) {
            const {viewInfo, rootViewType} = this.props;
            if (node.tag) {
                const {view, property} = this.property, {viewFields} = viewInfo;
                let field = {}, propsField = {}, viewRender = (view[rootViewType == "list" ? "tree" : rootViewType][node.tag] || []);
                this.setState({currentNode: node.nodeId});
                if (["field", "label"].includes(node.tag)) {
                    field = viewFields[node.attrs.name || node.attrs.for] || node.attrs;
                }
                if (node.tag == "field") {
                    propsField.fieldType = field.type;
                }
                if (node.tag == "field" && viewInfo.type == "form") {
                    viewRender = field.type in viewRender ? viewRender[field.type] : viewRender.default;
                }else if (node.tag == "field" && ["tree", "list"].includes(viewInfo.type) && rootViewType == "form") {
                    viewRender = view.tree.field;
                }
                return viewRender.map((attr) => {
                    let {modifiers} = node.attrs, value = attr in (modifiers || {}) ? modifiers[attr] : (node.attrs[attr] || field[attr]);
                    if (attr == "widget" && !value) {
                        value = field.type;
                    }
                    if (typeof value == "object" && !Array.isArray(value)) {
                        value = JSON.stringify(value);
                    }
                    let view = property[attr], params = {...view, ...(view.props || {}), ...propsField,
                            value: this.prepareValue(attr, value || view.default || false, node),
                            node: node, onChange: (valChange) => this.onPropertyChange(node, attr, valChange)},
                        attrWidget = new view.widget(this, params);
                    attrWidget.renderElement();
                    return attrWidget.$el;
                });
            }
            return [];
        },
        onClickTab: function () {},
        preparePropsTab: function () {
            return {tabs: this.tabs, data: this.state.tab, onClickTab: this.onClickTab.bind(this)}
        },
        renderTab: function () {
            this.ref.tab = new FieldBasic.Tab(this, this.preparePropsTab());
            this.ref.tab.renderElement();
            this.$el.find("._wEPTab").empty().append(this.ref.tab.$el);
        },
        _renderTabWField: function () {
            const {bindSortable, viewInfo} = this.props,
                fieldsInfo = viewInfo.fieldsInfo[viewInfo.type];
            let wConFields = $(QWeb.render("ViewEdit.TabContentFields",
                {viewFields: this.viewFields.filter((field) => !(field.name in fieldsInfo))}));
            bindSortable(wConFields.find('._wTConC'));
            return wConFields;
        },
        _renderTabProperty: function () {
            const {viewInfo} = this.props;
            let wConProperty = $(QWeb.render("ViewEdit.TabContentProperty", {}));
            wConProperty.append(this._renderProperty(viewInfo.arch));
            return wConProperty;
        },
        onChangeBlock: function (block, data) {
            const {xpathNode, viewInfo, getNewChatter} = this.props, {arch} = viewInfo,
                parentNodeId = arch.nodeId, oldParentId = false, nodeId = arch.children[0].nodeId;
            if (xpathNode) {
                if (block.name == "header") {
                    let header = {tag: "header", children: []};
                    header.attrs = {modifiers: {}};
                    xpathNode(nodeId, oldParentId, parentNodeId, header, "before");
                }else if (block.name == "chatter") {
                    xpathNode(parentNodeId, oldParentId, parentNodeId, getNewChatter(), "append");
                }
                this.ref.tab._renderTabContent(true);
            }
        },
        renderBlock: function (wrap) {
            const {viewInfo} = this.props, {arch} = viewInfo, blocks = this.block.child,
                childArch = arch.children.map((childNode) => {
                    if (childNode.attrs && childNode.attrs.class
                        && childNode.attrs.class.indexOf("oe_chatter") >= 0) {
                        return "chatter";
                    }
                    return childNode.tag;
                });
            if (arch.tag == "form") {
                Object.keys(blocks).map((name) => {
                    let block = blocks[name];
                    if (!childArch.includes(name)) {
                        let radioWidget = new FieldBasic.Checkbox(this, Object.assign(block,
                            {onChange: (data) => this.onChangeBlock.bind(this)(block, data)}));
                        radioWidget.renderElement();
                        wrap.append(radioWidget.$el);
                    }
                });
            }
        },
        _renderTabComponent: function () {
            const {bindSortable} = this.props;
            let wConComponent = $(QWeb.render("FormViewEdit.TabComponentContent", {}));
            this.renderBlock(wConComponent.find("._wComCon"));
            wConComponent.find('._wComCon').append(Object.keys(this.components).map((comName) => {
                    let com = Object.assign({}, this.components[comName]);
                    return QWeb.render("ViewEdit.TabComponent.Com", com)
                }
            ));
            bindSortable(wConComponent);
            return wConComponent;
        },
        reload: function () {
            this.renderElement();
        },
        renderElement: function () {
            this._super();
            this.renderTab();
            this.bindAction();
        }
    });

    return {EditBase: EditBase, ContentBase: ContentBase, PropertyBase: PropertyBase, WidgetBase: WidgetBase}
});
