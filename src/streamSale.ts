import fetch from 'node-fetch';

const url = 'http://store.steampowered.com/api/appdetails?l=ja';
const ids: string[] = ["1358140", "547140"];
const output = "タイトル：{0}\n価格：{1}\n割引前価格：{2}\n割引率：{3}%";

// Steam API レスポンスの型定義
interface PriceOverview {
    final_formatted: string;
    initial_formatted: string;
    discount_percent: number;
}

interface AppData {
    data: {
        name: string;
        price_overview: PriceOverview;
    };
}

interface ApiResponse {
    [key: string]: {
        success: boolean;
        data: AppData['data'];
    };
}

// Steam セール情報を取得する関数
export async function fetchSteamSaleInfo(): Promise<string> {
    let message = '';

    for (const id of ids) {
        try {
            const response = await fetch(`${url}&appids=${id}`);
            if (!response.ok) {
                console.error(`Request Error: ${response.status}`);
                continue;
            }

            const data = (await response.json()) as ApiResponse;
            const appData = data[id]?.data?.price_overview;

            if (appData && appData.discount_percent !== 0) {
                const title = data[id].data.name;
                const finalPrice = appData.final_formatted;
                const initialPrice = appData.initial_formatted;
                const discountPercent = appData.discount_percent;

                message += output
                    .replace("{0}", title)
                    .replace("{1}", finalPrice)
                    .replace("{2}", initialPrice)
                    .replace("{3}", String(discountPercent)) + "\n";
            }
        } catch (error) {
            console.error(`Error fetching data for app ID ${id}:`, error);
        }
    }

    return message || '現在割引中のタイトルはありません。';
}
