export const contacts = [
  { id: 'PM', name: 'Patrick McDonald', initials: 'PM', status: 'Available', role: 'Air Compliance Supervisor · PSC', preview: 'Let me know what you think.', time: '10:42 AM' },
  { id: 'AC', name: 'Alex Carter', initials: 'AC', status: 'In a meeting', role: 'Operations Analyst · PSC', preview: 'I added the notes to the board.', time: '9:18 AM' },
  { id: 'JT', name: 'Jordan Taylor', initials: 'JT', status: 'Available', role: 'Project Coordinator · PSC', preview: 'Sounds good to me.', time: 'Yesterday' },
];

export const selfConversation = {
  id: 'self',
  type: 'self',
  name: 'Enoch Olukolajo',
  initials: 'EO',
  status: 'You',
  role: 'Product Team Member · PSC',
};

export const initialConversations = {
  self: [],
  PM: [
    { id: 'pm-1', senderId: 'PM', text: "Here's the latest project update.", timestamp: '10:38 AM' },
    { id: 'pm-2', senderId: 'PM', text: 'Let me know what you think.', timestamp: '10:42 AM' },
    { id: 'pm-3', senderId: 'EO', text: "Thanks, I'll review it.", timestamp: '10:45 AM' },
  ],
  AC: [
    { id: 'ac-1', senderId: 'AC', text: 'I added the notes to the board.', timestamp: '9:18 AM' },
    { id: 'ac-2', senderId: 'EO', text: 'Great, thank you.', timestamp: '9:22 AM' },
  ],
  JT: [
    { id: 'jt-1', senderId: 'JT', text: 'The timeline looks good from my side.', timestamp: 'Yesterday' },
    { id: 'jt-2', senderId: 'EO', text: 'Sounds good. I will share the next steps shortly.', timestamp: 'Yesterday' },
  ],
};
