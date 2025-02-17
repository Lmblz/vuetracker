<template>

  <el-container v-if="$route.meta.layout === true" class="mainContainer">

    <el-aside width="200px">
      <TheMenu />
    </el-aside>

    <el-container>
      
      <el-header height="60px">
        <TheTopTask
          ref="TheTopTask"
        />
      </el-header>

      <el-main>

        <router-view></router-view>

      </el-main>

    </el-container>

  </el-container>

  <div v-else-if="$route.meta.layout === false" class="mainContainer">
    <h3 class="titleNoLayout">VueTracker</h3>
    <router-view></router-view>
  </div>

  <div v-else class="mainContainer" v-loading="true"></div>

</template>

<script>
  import { mapState, mapActions, mapMutations } from 'vuex'

  import TheMenu from './components/TheMenu.vue'
  import TheTopTask from './components/TheTopTask.vue'
  import TaskList from './components/TaskList.vue'

  export default {
    components: {
      TheMenu,
      TheTopTask,
      TaskList
    },
    computed: {
      ...mapState({
        tasks: (state) => state.tasks.tasks
      })
    },
    watch: {
      tasks: {
        // Mise à jour de toutes les tâches en API dès que tasks change
        deep: true,
        async handler (newVal, oldVal) {
          if (newVal !== null && oldVal !== null) {          
            try {
              await this.updateAllTasks()
            } catch (e) {
              console.error(e)
              this.sendError({
                title: 'Mode hors-ligne',
                message: `Synchronisation des tâches impossible`
              });
            }
          }
        }
      }
    },
    methods: {
      ...mapActions({
        setWatcherCurrentUser: 'users/setWatcherCurrentUser',
        fetchAllTasks: 'tasks/fetchAllTasks',
        updateAllTasks: 'tasks/updateAllTasks',
        sendError: 'notifications/sendError'
      }),
      ...mapMutations({
        SET_NOTIFIER: 'notifications/SET_NOTIFIER'
      })
    },
    async created () {
      // Mise en place de l'actualisation de l'utilisateur actuel
      this.setWatcherCurrentUser()

      // Mise en place du système de notification
      this.SET_NOTIFIER(this.$notify)

      // Récupération de toutes les tâches
      try {
        await this.fetchAllTasks()
      } catch (e) {
        console.error(e)
        this.sendError({
          title: 'Mode hors-ligne',
          message: `Récupération des tâches impossible`
        });
      }
    }
  };
</script>

<style lang="scss">
body { margin: 0; }
#app {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
.mainContainer { height: 100%; }

.titleNoLayout {
  margin: 50px auto;
}

.el-aside {
  height: 100%;
  color: #333;
  border-right: solid 1px #e6e6e6;
}
.el-header {
  padding: 0 !important;
  border-bottom: solid 1px #e6e6e6;
  color: #333;
  line-height: 60px;
  .el-input .el-input__inner {
    border: none !important;
  }
}
.el-notification {
  font-family: Avenir, Helvetica, Arial, sans-serif;
}

.highlight-line {
  background-color: #40a0ff31 !important
}

</style>