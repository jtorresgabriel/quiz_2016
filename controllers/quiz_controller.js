var models = require ('../models');
var Sequelize = require('sequelize');

//autoaload
exports.load = function (req, res, next, quizId) {
	models.Quiz.findById(quizId, {include: [models.Comment]}).then(function(quiz) {
			if (quiz) {
				req.quiz = quiz;
				next();
		}else{
			next( new Error ('No exite quizId=' + quizId));
		}
	}).catch(function (error) {	next(error); });
};

exports.ownershipRequired = function (req, res, next){
	var isAdmin = req.session.user.isAdmin;
	var quizAuthorId = req.quiz.AuthorId;
	var loggedUserId = req.session.user.id;

	if (isAdmin || quizAuthorId === loggedUserId){
		next();
	} else{ 
		console.log('Operación prohibida: El usuario logeado no es el autor del quiz, ni administrador.');
		res.send(403);
	}
};

//GET /quizzes
exports.index = function (req, res, next) {
	models.Quiz.findAll().then(function(quizzes) {
		res.render('quizzes/index.ejs', {quizzes: quizzes});
	})
	.catch(function(error) {next(error);
});
};

//GET/ quiezzes/new
exports.new =  function(req, res, next){
	var quiz = models.Quiz.build({question: "", answer: ""});
	res.render('quizzes/new', {quiz: quiz});
};

//GET /quizzes/:id
exports.show = function (req, res, next) {
				
			var answer = req.query.answer || '';

			res.render('quizzes/show', {quiz: req.quiz, answer: answer});
		};

// GET / quizzes/:id/check
exports.check = function(req, res, next){
	
	var answer = req.query.answer || '';
	
	var result = answer === req.quiz.answer ? 'Correcta' : 'Incorrecta';
	
	res.render('quizzes/result', {quiz: req.quiz, result: result, answer: answer});

};

//POST /quizzes/create
exports.create = function (req, res, next) {

	var authorId = req.session.user && req.session.user.id || 0;
	var quiz = models.Quiz.build({question: req.body.quiz.question,
									answer: req.body.quiz.answer, 
									AuthorId: authorId} );
//guarda en DB los campos pregunta y respuesta de quiz
quiz.save({fields: ["question", "answer", "AuthorId"]}).then(function(quiz){
	req.flash('sucess', 'Quiz creado con éxito.');
	res.redirect('/quizzes');
})
.catch(function(error) {
	req.flash('error', 'Error al crear un Quiz:' +error.message);
	next(error);
	});
};

//PUT /quizzes/:id
exports.update= function(req, res, next){
	req.quiz.question =req.body.quiz.question;
	req.quiz.answer = req.body.quiz.answer;

	req.quiz.save({fields: ["question", "answer"]}).then(function(quiz){
	req.flash('sucess', 'Quiz editado con éxito.');
	res.redirect('/quizzes');
})
.catch(Sequelize.ValidationError, function(error){
	req.flash('error', 'Errores en el formulario:');
	for(var i in error.errors){
		req.flash('error', error.errors[i].value);
	};
	res.render('quizzes/edit', {quiz: req.quiz});
})
.catch(function(error) {
	req.flash('error', 'Error al crear un Quiz:' +error.message);
	next(error);
	});
};

//GET / quizzes/:id/edit
exports.edit = function(req, res, next) {
	var quiz = req.quiz;
	res.render('quizzes/edit', {quiz: quiz});
};

//DELETE/ quizzes/:id
exports.destroy = function(req, res, next) {
	req.quiz.destroy()
	.then(function(){
		req.flash('sucess', 'Quiz borraso con exito.');
		res.redirect('/quizzes');
	})
.catch(function(error) {
	req.flash('error', 'Error al crear un Quiz:' +error.message);
	next(error);
	});
};