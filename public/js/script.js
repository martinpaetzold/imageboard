new Vue({
    el: "#main",
    data: {
        images: [],
    },
    mounted() {
        axios.get("/api/images").then((response) => {
            this.images = response.data;
        });
    },
});
