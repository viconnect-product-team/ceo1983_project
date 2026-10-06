const fs = require('fs');
const path = require('path');

const enPath = path.join(__dirname, '../packages/shared/locales/en.json');
const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));

const newKeys = {
  'meet.edit': 'Edit Meeting',
  'meet.deleteConfirm': 'Are you sure you want to delete meeting "{{title}}"?',
  'meet.attendeesCount': '{{count}} attendees',
  'meet.fields.title': 'Meeting Title',
  'meet.fields.type': 'Meeting Type',
  'meet.fields.date': 'Meeting Date',
  'meet.fields.time': 'Time',
  'meet.fields.status': 'Status',
  'meet.fields.location': 'Offline Meeting Venue',
  'meet.fields.zoomUrl': 'Online Meeting URL',
  'meet.fields.description': 'Agenda & Meeting Minutes',
  'meet.fields.attendees': 'Number of Attendees',
  'm.rhist.termRange': 'Term {from} – {to}',
  'm.shell.tab_qr': 'Digital Card',
};

Object.assign(en, newKeys);

fs.writeFileSync(enPath, JSON.stringify(en, null, 2) + '\n', 'utf8');
console.log('Successfully updated en.json with all missing keys!');
