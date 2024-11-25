use std::{
    fs,
    io::{prelude::*, BufReader},
    net::{TcpListener},
};

fn main() {
    let listener = TcpListener::bind("127.0.0.1:7878").unwrap();

    for stream in listener.incoming() {
        let mut stream = stream.unwrap();

        // Handle the connection
        let buf_reader = BufReader::new(&stream);

        let http_request: Vec<_> = buf_reader.lines().map(|result| result.unwrap()).take_while(|line| !line.is_empty()).collect();
        if let Some(first_line) = http_request.first() {
            // GET /index.html HTTP/1.1 -> ["GET", "/index.html", "HTTP/1.1"]
            let tokens: Vec<&str> = first_line.split_whitespace().collect();
            let mut resource = String::from(".");
            if tokens[1] == "/" { 
                resource += "/index.html";
            } else {
                resource += tokens[1];
            }

            match fs::read_to_string(resource) {
                // TODO: DRY up these write_alls and stuff
                Ok(contents) => {
                    let status_line = "HTTP/1.1 200 OK";
                    let length = contents.len();
                    let response = format!(
                        "{status_line}\r\nContent-Length: {length}\r\n\r\n{contents}"
                    );
                    stream.write_all(response.as_bytes()).unwrap();
                },
                Err(err) => {
                    if err.kind() == std::io::ErrorKind::NotFound {
                        let status_line = "HTTP/1.1 404 Not Found";
                        let contents = fs::read_to_string("404.html").unwrap();
                        let length = contents.len();

                        let response = format!(
                            "{status_line}\r\nContent-Length: {length}\r\n\r\n{contents}"
                        );
                        stream.write_all(response.as_bytes()).unwrap();
                    } else {
                        println!("Error reading file: {}", err);
                        let status_line = "HTTP/1.1 500";

                        let response = format!("{status_line}\r\n\r\n");
                        stream.write_all(response.as_bytes()).unwrap();
                    }
                }
            }
        } else {
            println!("Request didn't seem to have a first line");
            let status_line = "HTTP/1.1 404 Not Found";
            let contents = fs::read_to_string("404.html").unwrap();
            let length = contents.len();

            let response = format!(
                "{status_line}\r\nContent-Length: {length}\r\n\r\n{contents}"
            );

            stream.write_all(response.as_bytes()).unwrap();
        }
    }
}
