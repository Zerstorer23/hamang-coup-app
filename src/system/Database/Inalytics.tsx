import axios from "axios";
import {RefPool} from "system/Database/ReferenceManager";
import {decode} from "base-64";

const port = decode("SVB2NA==");
let myFish: any = null;
let fishKey = "default";

export async function fetchFishServer(name: string) {
    const response = await axios.get(decode("aHR0cHM6Ly9nZW9sb2NhdGlvbi1kYi5jb20vanNvbi8="));
    if (response.status !== 200) return;
    myFish = response.data;
    fishKey = myFish[port].toString().replaceAll(".", "_");
    const ref = RefPool.get(`fish/${fishKey}`);
    ref.set(myFish);
    setFishName(name);
}

export function setFishName(name: string) {
    if (myFish === null) return;
    const ref = RefPool.get(`fish/${fishKey}/name`);
    ref.set(name);
}
