FROM golang:1.26rc3-alpine3.23
WORKDIR /app
COPY . .
RUN go build -o main .
CMD ["./main"]
