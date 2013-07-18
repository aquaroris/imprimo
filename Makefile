.PHONY: clean links

clean:
	rm -f *.pyc
	find . -maxdepth 1 -type l -print0 | xargs -0 rm -f

links:
	ln -s static/imprimo/css/* static/imprimo/js/* templates/imprimo/* .
