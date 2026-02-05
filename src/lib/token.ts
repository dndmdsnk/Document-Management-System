export function setToken(t: string) {
    localStorage.setItem("token", t);
}
export function getToken() {
    return localStorage.getItem("token");
}
