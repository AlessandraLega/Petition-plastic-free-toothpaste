function createProfile(arr) {
    let query = "";
    for (let i = 0; i < arr.length; i++) {
        let newArr = arr[i].split(" ");
        let singleQuery =
            "INSERT INTO users (first, last, e_mail, password) VALUES ('";
        singleQuery += newArr[0] + "', '" + newArr[1];
        let lower = newArr[0].toLowerCase();
        console.log("lower :", lower);
        let email = newArr[0].toLowerCase() + "@mail.com";
        singleQuery += "', '" + email;
        singleQuery += "', 'password');";
        query += singleQuery;
    }
    return query;
}

console.log(
    createProfile([
        "Alessandra Lega",
        "Adrien Aminta",
        "Hoda A",
        "Konrad Rozyck",
        "Mohamad Soufi",
        "Swami Silva",
        "Peter Anderson",
    ])
);
