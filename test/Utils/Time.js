"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Time;
(function (Time) {
    function splitTime() {
        var now = new Date();
        var weekdays = [
            'Sunday',
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday'
        ];
        return {
            year: now.getFullYear(),
            month: now.getMonth() + 1,
            date: now.getDate(),
            hours: now.getHours(),
            minutes: now.getMinutes(),
            seconds: now.getSeconds(),
            milliseconds: now.getMilliseconds(),
            day: now.getDay(),
            weekday: weekdays[now.getDay()],
            period: now.getHours() < 12 ? 'AM' : 'PM'
        };
    }
    function short() {
        var now = splitTime();
        return now.year + "/" + now.month + "/" + now.date + ", " + now.hours + ":" + now.minutes + " " + now.period;
    }
    Time.short = short;
    function format(timeFormat) {
    }
    Time.format = format;
})(Time = exports.Time || (exports.Time = {}));
