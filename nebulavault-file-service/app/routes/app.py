from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route("/api/files/upload", methods=["POST"])
def upload():
    if request.is_json:
      body = request.get_json()
      print(body)
      return jsonify({
       "status": 200,
       "message": "GOT JSON"  
      })
    else:
      return jsonify({
       "status": 500,
       "message": "Not JSON"  
      })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)