var GlideRecord = require("./GlideRecord");

var gr = new GlideRecord("u_user");
gr.query();

while(gr.next()) {
  console.log("First name: ", gr.first_name);
}
