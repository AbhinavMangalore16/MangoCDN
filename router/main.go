package main
import (
	"hash/crc32"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"sort"
	"sync"
)
var edges = []string{
	"http://edge-us",
	"http://edge-eu",
	"http://edge-ind",
}

type Ring struct {
	nodes []uint32
	items map[uint32]string
	sync.Mutex
}

func NewRing() *Ring {
	r := &Ring{items: make(map[uint32]string)}
	for _,edge := range edges {
		hash:= crc32.ChecksumIEEE([]byte(edge))
		r.nodes = append(r.nodes, hash)
		r.items[hash] = edge
	}
	sort.Slice(r.nodes, func(i, j int) bool { return r.nodes[i]<r.nodes[j]})
	return r
}

func (r *Ring) Get(key string) string{
	hash:=crc32.ChecksumIEEE([]byte(key))
	idx:=sort.Search(len(r.nodes), func(i int) bool {return r.nodes[i]>=hash})
	if idx == len(r.nodes){
		idx = 0
	}
	return r.items[r.nodes[idx]]
}

func main(){
	ring := NewRing()
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request){
		tgtEdge := ring.Get(r.URL.Path)
		log.Printf("Routing %s to %s", r.URL.Path, tgtEdge)
		origin, _ :=url.Parse(tgtEdge)
		proxy := httputil.NewSingleHostReverseProxy(origin)

		proxy.ServeHTTP(w,r)
	})
	log.Println("GO Router listening on port :8000")
	log.Fatal(http.ListenAndServe(":8000", nil))
}