var u_users = require("./u_users.data.json");
var u_tasks = require("./u_tasks.data.json");

db = {
  u_user: u_users,
  u_task: u_tasks
};

function GlideRecord(table) {
  var self = this;
  this.data = db[table];
  this.table = this.data;
  this.queries = [];
  this.currentPosition = -1;
  this.setCurrentRecord(this.table[0]);
}

GlideRecord.prototype.setCurrentRecord = function(record) {
  this.currentRecord = record;
  var self = this;
  Object.getOwnPropertyNames(this.table[0]).forEach(function(key) {
    self[key] = record[key];
  });
};

GlideRecord.prototype.get = function(id) {
  var newRecord = this.table.filter(record => record.sys_id === id)[0];
  if (newRecord !== undefined) {
    this.currentPosition = this.table.indexOf(newRecord);
    this.setCurrentRecord(currentPosition);
    return true;
  } else {
    return false;
  }
};

GlideRecord.prototype.next = function() {
  this.currentPosition += 1;
  var currentRecord = this.table[this.currentPosition];
  if (currentRecord !== undefined) {
    this.setCurrentRecord(currentRecord);
    return true;
  } else {
    return false;
  }
};

GlideRecord.prototype.addQuery = function(field, value) {
  this.queries.push({ field, value });
};

GlideRecord.prototype.query = function() {
  var tables = this.data;
  this.queries.forEach(q => {
    tables = this.data.filter(e => e[q.field] === q.value);
  });
  this.table = tables;
  this.currentPosition = -1;
  this.setCurrentRecord(this.table[0]);
};

module.exports = GlideRecord;
