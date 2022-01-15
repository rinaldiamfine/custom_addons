import json
import ast
from odoo import models, api, fields
import collections
from lxml import etree, html

from odoo.addons.base.models.qweb import QWeb
from lxml import etree

compile_node = QWeb._compile_node
compile_directive_content = QWeb._compile_directive_content
render_supper = QWeb.render
compile_dynamic_attributes = QWeb._compile_dynamic_attributes
compile_directive_set = QWeb._compile_directive_set
compile_directive_foreach = QWeb._compile_directive_foreach
compile_widget_options = QWeb._compile_widget_options
is_static_node = QWeb._is_static_node

def _is_static_node(self, el, options):
    from_odo_studio = self.env.context.get("from_odo_studio", False)
    if from_odo_studio:
        if "options" in options and options["options"].get("EditReport", False):
            return False
    return is_static_node(self, el, options)

def render(self, template, values=None, **options):
    from_odo_studio = self.env.context.get("from_odo_studio", False)
    if from_odo_studio:
        self.clear_caches()
        options["EditReport"] = True
    return render_supper(self, template, values=values, options=options)

def get_field_chain(self, attribute, first=True):
    root_param = []
    if isinstance(attribute, ast.Attribute):
        root_param.append(attribute.attr)
        root_param += self.get_field_chain(attribute.value, False)
    elif isinstance(attribute, ast.Call):
        root_param.append(attribute.args[0].s)
    if first:
        root_param.reverse()
    return root_param

def _compile_directive_set(self, el, options):
    from_odo_studio = self.env.context.get("from_odo_studio", False)
    if from_odo_studio:
        value_edit = False
        var_name = el.get('t-set')
        if 't-value' in el.attrib:
            value_edit = el.get('t-value')
    result = compile_directive_set(self, el, options)
    if from_odo_studio:
        if value_edit:
            result.append(ast.Assign(
                targets=[self._values_var(ast.Str(var_name + "_edit"), ctx=ast.Store())],
                value=ast.Str(value_edit)
            ))
    return result

def _compile_directive_foreach(self, el, options):
    from_odo_studio = self.env.context.get("from_odo_studio", False)
    if from_odo_studio:
        var_name = el.get('t-as').replace('.', '_')
        value_edit = el.get('t-foreach')
    result = compile_directive_foreach(self, el, options)
    if from_odo_studio:
        return [ast.Assign(
                targets=[self._values_var(ast.Str(var_name + "_edit"), ctx=ast.Store())],
                value=ast.Str(value_edit)
            )]  + result
    return result

def _compile_widget_options(self, el):
    from_odo_studio = self.env.context.get("from_odo_studio", False)
    if from_odo_studio:
        options = el.get("t-options")
        if options:
            el.set("options-values", options)
    return compile_widget_options(self, el)

def _compile_dynamic_attributes(self, el, options):
    from_odo_studio = self.env.context.get("from_odo_studio", False)
    nodes = compile_dynamic_attributes(self, el, options)
    if from_odo_studio:
        for name, value in el.attrib.items():
            if name == "options-values":
                # el.attrib.pop("options-check")
                options_edit = '{'
                value_expr = self._compile_expr(value)
                for idx, val in enumerate(value_expr.values):
                    key_expr = value_expr.keys[idx]
                    if isinstance(val, ast.Attribute):
                        if isinstance(key_expr, ast.Str):
                            chain_str = ".".join(self.get_field_chain(val))
                            options_edit += '"{name}": '.format(name=key_expr.s)
                            options_edit += '{"attribute": "attribute", '
                            options_edit += '"field_chain": "{field_chain}"'.format(field_chain=chain_str)
                            options_edit += '},'
                    elif isinstance(val, ast.Call):
                        pass
                    elif isinstance(val, ast.BoolOp):
                        pass
                    elif isinstance(val, ast.NameConstant):
                        pass
                options_edit += '}'
                nodes.append(ast.Call(
                    func=ast.Attribute(
                        value=ast.Name(id='self', ctx=ast.Load()),
                        attr='get_options_values',
                        ctx=ast.Load()
                    ),
                    args=[
                        self._compile_expr(options_edit),
                        (self._compile_expr(value) if len(value) > 1 else False)
                    ], keywords=[],
                    starargs=None, kwargs=None
                ))
        nodes.append(ast.Call(
            func=ast.Attribute(
                value=ast.Name(id='self', ctx=ast.Load()),
                attr='prepare_data_values',
                ctx=ast.Load()
            ),
            args=[
                ast.Name(id='values', ctx=ast.Load()),
            ], keywords=[],
            starargs=None, kwargs=None
        ))
    return nodes

def prepare_data_values(self, values):
    result = {}
    for key, val in values.items():
        result[key] = type(val).__name__
    return [('data-values', json.dumps(result))]

def get_options_values(self, option_raw, option_value):
    for name, value in option_raw.items():
        # if value and type(value) is dict and value['attribute'] == "attribute":
            # value['root_obj'] = value['root_obj']._name
        option_value[name] = value
    for name, value in option_value.items():
        if type(value) is bool:
            option_value[name] = str(value).lower()
    attr_edit = [('options-values', json.dumps(option_value))]
    return attr_edit


def _compile_node(self, el, options):
    from_odo_studio = self.env.context.get("from_odo_studio", False)
    if from_odo_studio:
        path = options['root'].getpath(el)
        el.set("path-xpath", path)

        if not options.get("data-oe-xpath"):
            pass
        if options.get("oe_model") and not options.get("data-oe-model"):
            el.set("data-oe-model", options.get("oe_model"))

        if options.get("oe_id") and not options.get("data-oe-id"):
            el.set("data-oe-id", options.get("oe_id"))

    return compile_node(self, el, options)

def _compile_directive_content(self, el, options):
    from_odo_studio = self.env.context.get("from_odo_studio", False)
    if from_odo_studio and el.getchildren():
        indexes = collections.defaultdict(lambda: 0)
        for item in el:
            indexes[item.tag] += 1
            if isinstance(item, etree._Comment):
                continue
            if el.get("data-oe-model") and el.get("data-oe-id"):
                data_model = el.get("data-oe-model")
                data_id = el.get("data-oe-id")
                options["oe_model"] = data_model
                options["oe_id"] = data_id
    return compile_directive_content(self, el, options)


QWeb.get_field_chain = get_field_chain
QWeb.prepare_data_values = prepare_data_values
QWeb.get_options_values = get_options_values
QWeb.render = render
QWeb._compile_dynamic_attributes = _compile_dynamic_attributes
QWeb._compile_directive_set = _compile_directive_set
QWeb._compile_directive_foreach = _compile_directive_foreach
QWeb._compile_widget_options = _compile_widget_options
QWeb._is_static_node = _is_static_node

QWeb._compile_node = _compile_node
QWeb._compile_directive_content = _compile_directive_content
