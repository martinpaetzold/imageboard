new Vue({
    el: "#main",
    data: {
        title: "",
        username: "",
        description: "",
        file: "",
        images: [],
        selectedImageID: false,
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

// vue component / overlay
Vue.component("image-overlay", {
    template: "#template-image-overlay",
    props: ["id"],
    data: function () {
        return {
            url: "",
            title: "",
            username: "",
            createdAt: "",
            description: "",
        };
    },
    methods: {
        closeMe: function () {
            this.$emit("close");
        },
    },
    mounted: function () {
        axios.get("/api/image/" + this.id).then((response) => {
            const {
                url,
                username,
                title,
                created_at,
                description,
            } = response.data;
            this.url = url;
            this.username = username;
            this.title = title;
            this.createdAt = new Date(created_at).toLocaleDateString();
            this.description = description;
        });
    },
});
