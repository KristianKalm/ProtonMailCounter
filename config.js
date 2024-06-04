/* Domain that opened on click */
const PROTON_DOMAIN = "https://mail.proton.me/";

/* This is value in minutes how often new pinned tab is launched (in minutes) */
const ALARM_TIME_MINUTES = 15;

/* This is time how long the pinned tab stays open, this should be long enough for page fully to load (in ms) */
const LOADING_TIME_FOR_PROTON_MAIL_INBOX = 5000;
/* This for avoid flickering, loading time when tab title turns from 'Inbox' to '(#) Inbox' (in ms) */
const LOADING_TIME_FOR_INBOX_TITLE_UPDATE = 1000;

const ALARM_NAME = "checkUnreadCount";