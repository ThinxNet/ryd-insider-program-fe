export default {
  data: () => ({widgetVersion: '1.0'}),
  mounted() {
  },
  methods: {

  },
  computed: {
    widgetId() {
      return this.$options.name;
    }
  }
}
