import axios, { AxiosResponse } from 'axios';

interface CryptocurrencyResponse {
  data: {
    id: number;
    name: string;
    symbol: string;
    // Add other properties based on the response structure
  }[];
  // You can add more properties from the API response here
}

export const fetchCryptocurrencyListings =
  async (): Promise<CryptocurrencyResponse | null> => {
    try {
      const response: AxiosResponse<CryptocurrencyResponse> = await axios.get(
        'https://sandbox-api.coinmarketcap.com/v1/cryptocurrency/trending/latest',
        {
          headers: {
            'X-CMC_PRO_API_KEY': '35436a78-f75f-466c-a1c0-098af1116df9',
          },
        },
      );

      // success
      const json: CryptocurrencyResponse = response.data;
      // console.log(json);
      return json; // Return the JSON response
    } catch (ex) {
      console.error(ex);
      return null; // Return null in case of error
    }
  };

// Example usage (optional, can be removed when used as a module):
// fetchCryptocurrencyListings().then(data => {
//   if (data) {
//     // Handle the fetched data here
//   }
// });
