import parse from "url-parse";

export function logToCurl({url, method, params, query, data, headers = {}}: any) {
  const request = parse(url, true);
  if (params) {
    request.set("query", Object.assign(params, query));
  }

  let curl = `curl -X ${method.toUpperCase()} '${request.toString()}'`;

  if (data) {
    curl += ` -d '${JSON.stringify(data)}'`;
  }

  curl += Object.entries(headers).reduce((curlHeaders, [key, value]) => `${curlHeaders} -H '${key}: ${value}'`, "");

  return curl;
}
