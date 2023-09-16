const app = Vue.createApp({
    data() {
        return {
            numberCSS: 2,
            title: '<b>Hello World</b>',
            logoSource: 'https://cdn.svgporn.com/logos/vue.svg',
            tsFormatter: Intl.DateTimeFormat('fr', { hour: '2-digit', minute: '2-digit' }),
            tasks: [],
            taskId: 1,
            taskName: '',
            isTaskInProgress: false,
            startTime: null,
            nowTime: null,
            intervalEverySecond: null,
            errorMsg: null,
        }
    },
    computed: {
        currentDuration() {
            if (this.startTime && this.nowTime) {
                return this.durationBetweenTimestamps(this.startTime, this.nowTime)
            } else {
                return '00:00:00'
            }
        }
    },
    watch: {
        isTaskInProgress(isInProgress) {
            if (isInProgress) {
                this.intervalEverySecond = setInterval(() => {
                    this.nowTime = Date.now();
                }, 1000)
            } else {
                clearInterval(this.intervalEverySecond);
            }
        }

    },
    methods: {
        startTask() {
            // Vérification
            if (this.taskName.length === 0) {
                this.errorMsg = 'Veuillez saisir un nom de tâche';
                return;
            } else if (this.isTaskInProgress) {
                this.errorMsg = 'Une tâche est déjà en cours';
                return;
            } else {
                this.errorMsg = null;
            }

            // Début de la tâche
            this.isTaskInProgress = true;
            this.startTime = Date.now();
            this.nowTime = Date.now();
        },
        stopTask() {
            // Vérification
            if (this.isTaskInProgress === false) {
                this.errorMsg = 'Aucune tâche en cours';
                return;
            }

            // Enregistrement de tâche
            this.tasks.unshift({
                id: this.getAnId(),
                name: this.taskName,
                start: this.startTime,
                end: Date.now(),
                duration: this.durationBetweenTimestamps(this.startTime, Date.now()),
            });

            // Fin de la tâche
            this.nowTime = null;
            this.errorMsg = null;
            this.isTaskInProgress = false;
            this.taskName = '';
        },
        toggleTask() {
            if (this.isTaskInProgress) {
                this.stopTask();
            } else {
                this.startTask();
            }
        },
        deleteTask(taskId) {
            let taskIndex = null;
            this.tasks.forEach((task, index) => {
                if (task.id === taskId) {
                    taskIndex = index;
                }
            })

            this.tasks.splice(taskIndex, 1);
        },
        replayTask(taskId) {
            if (this.isTaskInProgress) {
                this.stopTask();
            }

            let taskIndex = this.tasks.findIndex(task => task.id === taskId);
            let currentTask = this.tasks[taskIndex];

            this.$nextTick(() => {
                this.taskName = currentTask.name;
                this.startTask();
            })
        },
        getAnId() {
            return this.taskId++;
        },
        formatTimestamp(ts) {
            return this.tsFormatter.format(ts);
        },
        durationBetweenTimestamps(start, end) {
            let seconds = Math.floor((end / 1000) - (start / 1000));
            let minutes = Math.floor(seconds / 60);
            const hours = Math.floor(minutes / 60);
            seconds = seconds % 60;
            minutes = minutes % 60;
            return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
        }
    },
})

app.component('task-actions', {
    template: `
        <button @click="sendReplay" type="button" class="btn btn-secondary" style="line-height: 1;">
            <svg height="15" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
            </svg>
        </button>
        <button @click="sendDelete" type="button" class="btn btn-danger" style="line-height: 1;">
            <svg height="15" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
        </button>
    `,
    props: {
        id: {
            type: Number,
            required: true,
        }
    },
    emits: ['delete', 'replay'],
    methods: {
        sendDelete() {
            this.$emit('delete', this.id)
        },
        sendReplay() {
            this.$emit('replay', this.id)
        }
    }
})

app.mount('#app')