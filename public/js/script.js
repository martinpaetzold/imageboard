new Vue({
    el: "#main",
    data: {
        title: "",
        username: "",
        description: "",
        file: "",
        images: [],
    },
    mounted() {
        axios.get("/api/images").then((response) => {
            this.images = response.data;
        });
    },
    methods: {
        uploadImage: function () {
            const formData = new FormData();
            formData.append("title", this.title);
            formData.append("username", this.username);
            formData.append("description", this.description);
            formData.append("file", this.file);

            axios.post("/upload", formData).then((response) => {
                this.images.push({
                    url: response.data.fileURL,
                    title: this.title,
                    username: this.username,
                    description: this.description,
                });
            });
        },
        fileSelected: function (event) {
            this.file = event.target.files[0];
        },
    },
});
