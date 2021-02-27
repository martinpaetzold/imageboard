new Vue({
    el: "#main",
    data: {
        animals: [],
    },
    mounted() {
        axios.get("/api/animals").then((response) => {
            this.animals = response.data;
        });
    },
});
