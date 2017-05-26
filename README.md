# ServiceNow Notes
Feel free to ask Issues or push PRs

## [Index](#index)
- [API](#api)
- [Common Global Objects](#common-global-objects)
- [Client Scripting](#client-scripting)
  - [UI Pages & Macros](#ui-pages) `sys_ui_page`
  - [UI Actions](#ui-actions) `sys_ui_action`
- [Server Scripting](#server)
  - [Script Includes](#script-includes) `sys_script_include`
  - [Business Rules](#business-rules) `sys_script`
- [General UI](#general-ui)
  - [Jelly](#jelly)
  - [Dashboards](#dashboards)
- [Roles](#roles)
- [Mail](#mail)
  - [Event based email notifications](#event-mail)
- [Tooling](#tooling)
- [Articles](#articles)
- [Blogs and Books](#resources)

## [API](#api)
- [overview](https://docs.servicenow.com/bundle/istanbul-servicenow-platform/page/script/general-scripting/reference/r_GlideClassOverview.html)
- [Client](https://developer.servicenow.com/app.do#!/api_doc?v=istanbul&id=client)
- [Server](https://developer.servicenow.com/app.do#!/api_doc?v=istanbul&id=server)

### Common APIs

#### [GlideForm](https://developer.servicenow.com/app.do#!/api_doc?v=istanbul&id=c_GlideFormAPI)
- `g_form.save()` save and reload form

#### [GlideAjax](https://developer.servicenow.com/app.do#!/api_doc?v=istanbul&id=c_GlideAjaxAPI)
- [user object cheat
  sheet](https://www.servicenowguru.com/scripting/user-object-cheat-sheet/)

#### [GlideRecord](https://developer.servicenow.com/app.do#!/api_doc?v=istanbul&id=c_GlideRecordScopedAPI)
- [query cheat
sheet](https://www.servicenowguru.com/scripting/gliderecord-query-cheat-sheet/)

## [Common global Objects](#common-global-objects)
- `gs`, `system` [GlideSystem](https://developer.servicenow.com/app.do#!/api_doc?v=istanbul&id=c_GlideSystemScopedAPI)

- `current` Current [GlideRecord](https://developer.servicenow.com/app.do#!/api_doc?v=istanbul&id=c_GlideRecordScopedAPI), (read, write). Only avaiable when writing business rules.
  
- `previous` Previous
  [GlideRecord](https://developer.servicenow.com/app.do#!/api_doc?v=istanbul&id=c_GlideRecordScopedAPI) (read). Only avaiable when writing business rules.

## [Client Scripting](#client-scripting])

**Tips, tricks and [ best practices
](http://wiki.servicenow.com/index.php?title=Client_Script_Best_Practices#Example:_g_scratchpad&gsc.tab=0)**

- `g_form.setValue()` Prevent an additional ajax call that will affect
  performance calling the function always with the 3 arguments: `fieldName`,
  `value`, `displayName`. Without `displayName` the function will have to ask
  the server which value should be displayed.

### [UI Pages & Macros](#ui-pages)
The Html in UI Pages is actually xml + jelly templating with extended functionality
provided by servicenow. Macros are just jelly components. Jelly is evaluated
inside the server therefore the server apis are available.

```xml
<j:set var="jvar_hello" value="Hello"/>

<g:evaluate jelly="true">
  var script_name = jelly.jelly_name + " Zeca Urubu"
</g:evaluate>

<p>${jvar_hello} ${name}</p>
```

The `evaluate` tag can access the Jelly variables. These are copied into the
`jelly` Javascript object. The `script_name` js variable is then set. JEXL
`${jvar_hello} ${name}` is used to output text and it has access to the js
variable.

#### Notes on global variable leaking
Do not forget to choose unique ids for the css selectors.

Prevent global variable leaking with [IIFEs](http://benalman.com/news/2010/11/immediately-invoked-function-expression/):
```javascript
var some_value = "outside scope";

(function(x) {
  "use strict";
  // code goes here
  
  console.log(x) // "outside scope";
})(some_value);
```
### [UI Actions](#ui-actions)

#### Conditions

Are always evaluated server-side. Use `gs` and `current` to access user and
current record data.

#### Scripts

Use
[GlideAjax](https://developer.servicenow.com/app.do#!/api_doc?v=istanbul&id=c_GlideAjaxAPI) to perform asynchronous requests.
- `GlideAjax.addParam("sysparm_yadda-yadda")` sysparm, not sysparam!!.

**Example**
```javascript
// UI Action Condition

// Checks if the current user has the role "admin"
// `current` is a GlideRecord. Remember the fields (and roles and tables) names are 
// usually preceded by "u_"
gs.hasRole("admin") && current.u_active == false



// UI Action Script

function setActiveToTrue() {
  // Specify which Script Include should be used
  var ga = new GlideAjax('ToggleActive');

  // Get current item unique Id
  var sys_id = g_form.getUniqueValue();

  // Required. Specify which method from the previous script will be used 
  ga.addParam('sysparm_name','activate');

  // Additional addParams will pass parameters to the previously specified method
  // Can be accessed through "this.getParameter("sysparm_sys_id")"
  ga.addParam('sysparm_sys_id', sys_id);


  // Perform the request with specified callback
  // The response is a simple xml document
  // `answer` attribute is the method return value
  ga.getXML(function(response) {
    var answer = response.responseXML.documentElement.getAttribute("answer");
    alert(anwer)
  });
}



// Script Include

// Remember to check "[ x ] Client Callable"
// server side executed

var ToggleActive = Class.create();
ToggleMovie.prototype = Object.extendsObject(AbstractAjaxProcessor, {

  activate: function() {
    var sys_id = this.getParameter("sysparm_sys_id");
    var table = "u_table_name";
    var field = "u_active";
    var gr = new GlideRecord(table);
    // Get desired item
    gr.get(sys_id);
    gr.setValue(field, true);
    gr.update();

    // Cant find any reference about action object. If u know please pr!!
    action.setRedirectURL(current);

    return "The field value is: " + gr[field];
  },

  type: "ToggleMovie"
});
```
## [Server Scripting](#server-scripting)

### [Script Includes](#script-includes)
- `action.setRedirectURL()`

### [Business Rules](#business-rules)

## [Roles](#roles)
- ITIL users for impersonation: User, Joe Employe, Beth Anglin (has some other roles such as catalog_manager)




## [General UI](#general-ui)
- [Creating new homepages](http://wiki.servicenow.com/index.php?title=Creating_New_Homepages#gsc.tab=0)

### [Jelly](#jelly)
Jelly is a tool for turning XML into executable code. Think of it as html with
scripting and processing power. Some common tags:

#### `<g:evaluate>`

Used to evaluate an expression written in Rhino
JavaScript and sometimes to set a variable to the value of the expression.

The last statement in the expression is the value the variable will contain.
```xml
<g2:evaluate var="jvar_page" jelly="true">
     var page = "";
     var pageTitle = "";
     var pageGR = new GlideRecord("cmn_schedule_page");
     pageGR.addQuery("type", jelly.jvar_type");
     pageGR.query();
     if (pageGR.next()) {
        page = pageGR.getValue("sys_id");
        pageTitle = pageGR.getDisplayValue();
     }
     page;
</g2:evaluate>
```
```xml
<g2:evaluate var="not_important" expression="sc_req_item.popCurrent()"/>
```


### [DashBoards](#dashboards)
- [Creating Dashboards](http://wiki.servicenow.com/index.php?title=Creating_Performance_Analytics_Dashboards#gsc.tab=0)

## [Mail](#mail) 
`sys_email`
- [Example scripting for email notifications](https://docs.servicenow.com/bundle/istanbul-servicenow-platform/page/script/server-scripting/reference/r_ExScptEmlNtfn.html)
- [Mail script API](https://docs.servicenow.com/bundle/istanbul-servicenow-platform/page/script/server-scripting/reference/r_MailScriptAPI.html) i.e

  `email.setFrom(String: address)` override the sender address
  
  `email.setSubject(String: subject)` override the subject of the message

- Create mail scripts in **System Policy** > **Email** > **Notification Email
  Script** and refer to them by using `${mail_script:script name}` in the script
  field

### [Enabling the email client](#email-client)
1. **System Definition** > **Dictionary**
2. Find the record `u_maintenance` that does not have an entry in the **Column
   name** field
3. Right click > **Advanced View**, insert `email_client` in the **Attributes**
   field

### [Event based email notifications](#event-email)
1. Create the event in **System Policy** > **Events** > **Registry** `sysevent_register.do`
2. **System Notification** > **Email** > **Notifications**, right-click >
3. **Advanced View**
4. Send when -> event is fired
5. Make sure to check `Send to event creator` to true when testing
6. profit

## [Tooling](#tooling)
### Chrome extensions
| Name  |   Description |
| --------   | ----------    |
|[Servicenow Utils](https://chrome.google.com/webstore/detail/servicenow-utils/jgaodbdddndbaijmcljdbglhpdhnjobg)  | Query templates, save with `<c-s>`, file sync :heart:|
|[Prettier JS](https://chrome.google.com/webstore/detail/prettier-js/fcdlmdpongmamnibeohhniinfgmnhkob)  | Chrome extension. Beautifully format textareas js code with [prettier](https://github.com/prettier/prettier) |
|[atomic chrome](https://atom.io/packages/atomic-chrome) |Edit chrome textareas directly from atom. Useful when editing large scripts.  |
| [Styler](https://chrome.google.com/webstore/detail/styler/bogdgcfoocbajfkjjolkmcdcnnellpkb) | Run custom css and javascript in web pages. See why below |
| [wasavi](https://chrome.google.com/webstore/detail/wasavi/dgogifpkoilgiofhhhodbodcfgomelhe) |  Transforms textarea element of any page into a VI editor |
 
### Tips and tricks

**Increasing servicenow text editor width**:

```css
/* Add the following css to styler (chrome extension) */
.col-xs-10.col-md-9.col-lg-8.form-field.input_controls,
.col-xs-10.col-md-9.col-lg-8.form-field.input_controls {
	width: 100%;
}
```
 

## [Articles](#articles)
- [Client and server code in one UI
  Action](https://www.servicenowguru.com/system-ui/ui-actions-system-ui/client-server-code-ui-action/)
- [Always use getters and
  setters](http://snprotips.com/blog/2017/4/9/always-use-getters-and-setters)
- [Building custom charts and reports](https://codecreative.io/servicenow/how-to-build-custom-charts-and-reports)

## [Blogs and Books](#resources)
- [snprotips](http://snprotips.com/)
- [service now guru](https://www.servicenowguru.com/)
- [/r/servicenow](https://www.reddit.com/r/servicenow/)
- [Mastering
  ServiceNow](http://www.saraiva.com.br/mastering-servicenow-9476393.html)
- [Learning
  ServiceNow](https://www.amazon.com/Learning-ServiceNow-Tim-Woodruff/dp/1785883321) From snprotips guy.
