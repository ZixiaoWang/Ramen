export namespace Time {

    function splitTime() {
        let now = new Date();
        let weekdays = [
            'Sunday',
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday'
        ]
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
        }
    }
    
    export function short() {
        let now = splitTime();
        return `${now.year}/${now.month}/${now.date}, ${now.hours}:${now.minutes} ${now.period}`;
    }

    export function format(timeFormat: string) {
        
    }
}